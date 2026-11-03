import { isAdmin } from "@/lib/auth";
import { listRsvps } from "@/lib/store";
import { EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";

// Quote every cell and neutralise spreadsheet formulas (=, +, -, @).
function cell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = (await listRsvps()).sort((a, b) => a.at.localeCompare(b.at));
  const lines = [["Name", "Day", "Visit date", "People", "Replied (IST)"].map(cell).join(",")];
  for (const r of rows) {
    const day = EVENT.days.find((d) => d.id === r.day)?.label || r.day;
    const at = new Date(r.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    lines.push([r.name, day, r.laterDate || "", r.guests, at].map(cell).join(","));
  }
  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="housewarming-rsvps.csv"',
      "Cache-Control": "no-store",
    },
  });
}
