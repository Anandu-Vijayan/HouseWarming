import { listRsvps } from "@/lib/store";
import { EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guest list", robots: { index: false } };

export default async function Guests({ searchParams }) {
  const { key } = await searchParams;
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return (
      <main className="guests">
        <h1>Guest list</h1>
        <p>Add <code>?key=</code> with your ADMIN_KEY to the address to see replies.</p>
      </main>
    );
  }

  const rsvps = (await listRsvps()).sort((a, b) => b.at.localeCompare(a.at));
  const totals = EVENT.days.map((d) => {
    const rows = rsvps.filter((r) => r.day === d.id);
    return { ...d, replies: rows.length, people: rows.reduce((n, r) => n + r.guests, 0) };
  });

  return (
    <main className="guests">
      <h1>Guest list</h1>
      <div className="totals">
        {totals.map((t) => (
          <div key={t.id} className="total">
            <p className="total-num">{t.people}</p>
            <p>
              people on {t.label} ({t.replies} {t.replies === 1 ? "reply" : "replies"})
            </p>
          </div>
        ))}
      </div>
      {rsvps.length === 0 ? (
        <p>No replies yet. Share the invite link to start collecting them.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Day</th><th>People</th><th>Replied</th></tr>
            </thead>
            <tbody>
              {rsvps.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>
                    {EVENT.days.find((d) => d.id === r.day)?.label || r.day}
                    {r.laterDate ? `: ${r.laterDate}` : ""}
                  </td>
                  <td>{r.guests}</td>
                  <td>{new Date(r.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
