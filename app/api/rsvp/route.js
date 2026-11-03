import { NextResponse } from "next/server";
import { addRsvp } from "@/lib/store";
import { EVENT } from "@/lib/event";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send the form again." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 80);
  const day = String(body.day || "");
  const guests = Math.min(Math.max(parseInt(body.guests, 10) || 1, 1), 20);

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!EVENT.days.some((d) => d.id === day)) {
    return NextResponse.json({ error: "Pick the day you are coming." }, { status: 400 });
  }

  let laterDate = "";
  if (day === "later") {
    laterDate = String(body.laterDate || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(laterDate) || laterDate < EVENT.laterMinDate) {
      return NextResponse.json({ error: "Pick a date after the function." }, { status: 400 });
    }
  }

  try {
    await addRsvp({ name, day, laterDate, guests, at: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save your reply. Try again in a minute." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
