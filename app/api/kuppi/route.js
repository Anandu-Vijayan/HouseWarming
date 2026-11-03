import { NextResponse } from "next/server";
import { addKuppiVote, listKuppiVotes } from "@/lib/store";
import { BRANDS } from "@/lib/kuppi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ votes: await listKuppiVotes() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "വോട്ടുകൾ എടുക്കാൻ കഴിഞ്ഞില്ല." }, { status: 500 });
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "വോട്ട് വീണ്ടും അയയ്ക്കുക." }, { status: 400 });
  }
  const brand = String(body.brand || "");
  if (!BRANDS.some((b) => b.id === brand)) {
    return NextResponse.json({ error: "ഒരു കുപ്പി തിരഞ്ഞെടുക്കുക." }, { status: 400 });
  }
  try {
    await addKuppiVote(brand);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "വോട്ട് രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
