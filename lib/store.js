import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const FILE = path.join(process.cwd(), "data", "rsvps.json");
const KEY = "housewarming:rsvps";
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(url && token);
const usePg = Boolean(process.env.DATABASE_URL);

let sql;
let ready;
// Created lazily so the table exists on first use, no migration step.
function pg() {
  sql ??= neon(process.env.DATABASE_URL);
  ready ??= sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      day TEXT NOT NULL,
      later_date TEXT NOT NULL DEFAULT '',
      guests INT NOT NULL,
      at TIMESTAMPTZ NOT NULL
    )`;
  return ready.then(() => sql);
}

let readyKuppi;
function pgKuppi() {
  return pg().then((db) => {
    readyKuppi ??= db`
      CREATE TABLE IF NOT EXISTS kuppi_votes (
        id SERIAL PRIMARY KEY,
        brand TEXT NOT NULL,
        at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    return readyKuppi.then(() => db);
  });
}

async function redis(cmd) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return (await res.json()).result;
}

export async function addRsvp(entry) {
  if (usePg) {
    const db = await pg();
    await db`INSERT INTO rsvps (name, day, later_date, guests, at)
      VALUES (${entry.name}, ${entry.day}, ${entry.laterDate || ""}, ${entry.guests}, ${entry.at})`;
    return;
  }
  if (useRedis) {
    await redis(["RPUSH", KEY, JSON.stringify(entry)]);
    return;
  }
  const list = await readFile();
  list.push(entry);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2));
}

export async function listRsvps() {
  if (usePg) {
    const db = await pg();
    const rows = await db`SELECT id, name, day, later_date, guests, at FROM rsvps ORDER BY at`;
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      day: r.day,
      laterDate: r.later_date,
      guests: r.guests,
      at: new Date(r.at).toISOString(),
    }));
  }
  if (useRedis) {
    const raw = (await redis(["LRANGE", KEY, "0", "-1"])) || [];
    return raw.map((r) => withId(JSON.parse(r)));
  }
  return (await readFile()).map(withId);
}

// Redis and file entries have no row id; the timestamp identifies them.
function withId(e) {
  return { ...e, id: e.at };
}

async function readFile() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function deleteRsvp(id) {
  if (usePg) {
    const n = parseInt(id, 10);
    if (!Number.isInteger(n)) return;
    const db = await pg();
    await db`DELETE FROM rsvps WHERE id = ${n}`;
    return;
  }
  if (useRedis) {
    const raw = (await redis(["LRANGE", KEY, "0", "-1"])) || [];
    const hit = raw.find((r) => JSON.parse(r).at === id);
    if (hit) await redis(["LREM", KEY, "1", hit]);
    return;
  }
  const list = await readFile();
  await fs.writeFile(FILE, JSON.stringify(list.filter((e) => e.at !== id), null, 2));
}

// ---------- Pick a Kuppi votes: an ordered list of brand ids ----------
const KUPPI_KEY = "housewarming:kuppi";
const KUPPI_FILE = path.join(process.cwd(), "data", "kuppi.json");

async function readKuppiFile() {
  try {
    return JSON.parse(await fs.readFile(KUPPI_FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function addKuppiVote(brand) {
  if (usePg) {
    const db = await pgKuppi();
    await db`INSERT INTO kuppi_votes (brand) VALUES (${brand})`;
    return;
  }
  if (useRedis) {
    await redis(["RPUSH", KUPPI_KEY, brand]);
    return;
  }
  const list = await readKuppiFile();
  list.push(brand);
  await fs.mkdir(path.dirname(KUPPI_FILE), { recursive: true });
  await fs.writeFile(KUPPI_FILE, JSON.stringify(list));
}

export async function listKuppiVotes() {
  if (usePg) {
    const db = await pgKuppi();
    return (await db`SELECT brand FROM kuppi_votes ORDER BY id`).map((r) => r.brand);
  }
  if (useRedis) return (await redis(["LRANGE", KUPPI_KEY, "0", "-1"])) || [];
  return readKuppiFile();
}
