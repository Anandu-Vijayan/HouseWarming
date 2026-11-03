import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "hw_admin";

function digest(s) {
  return createHash("sha256").update(String(s)).digest();
}

export function keyMatches(input) {
  const key = process.env.ADMIN_KEY;
  if (!key) return false;
  return timingSafeEqual(digest(input), digest(key));
}

export async function isAdmin() {
  const key = process.env.ADMIN_KEY;
  if (!key) return false;
  const got = (await cookies()).get(COOKIE)?.value;
  if (!got) return false;
  const want = digest(key).toString("hex");
  return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export async function setAdminCookie() {
  (await cookies()).set(COOKIE, digest(process.env.ADMIN_KEY).toString("hex"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE);
}
