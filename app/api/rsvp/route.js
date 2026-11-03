import { NextResponse } from "next/server";
import { addRsvp } from "@/lib/store";
import { EVENT } from "@/lib/event";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ഫോം വീണ്ടും അയയ്ക്കുക." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 80);
  const day = String(body.day || "");
  const guests = Math.min(Math.max(parseInt(body.guests, 10) || 1, 1), 20);

  if (name.length < 2) {
    return NextResponse.json({ error: "നിങ്ങളുടെ പേര് നൽകുക." }, { status: 400 });
  }
  if (!EVENT.days.some((d) => d.id === day)) {
    return NextResponse.json({ error: "വരുന്ന ദിവസം തിരഞ്ഞെടുക്കുക." }, { status: 400 });
  }

  let laterDate = "";
  if (day === "later") {
    laterDate = String(body.laterDate || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(laterDate) || laterDate < EVENT.laterMinDate) {
      return NextResponse.json({ error: "ചടങ്ങിന് ശേഷമുള്ള തീയതി തിരഞ്ഞെടുക്കുക." }, { status: 400 });
    }
  }

  try {
    await addRsvp({ name, day, laterDate, guests, at: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "മറുപടി സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ഒരു മിനിറ്റ് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
