import { isAdmin } from "@/lib/auth";
import { listRsvps } from "@/lib/store";
import { EVENT } from "@/lib/event";
import { login, logout, remove } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function Admin({ searchParams }) {
  const { error } = await searchParams;

  if (!process.env.ADMIN_KEY) {
    return (
      <main className="guests">
        <h1>Admin</h1>
        <p>Set <code>ADMIN_KEY</code> in <code>.env.local</code> and restart the server.</p>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="guests">
        <h1>Admin</h1>
        <form action={login} className="admin-login">
          <label className="field">
            <span>Admin key</span>
            <input type="password" name="key" autoComplete="current-password" required />
          </label>
          {error && <p className="err" role="alert">Wrong key.</p>}
          <button className="btn" type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  const rsvps = (await listRsvps()).sort((a, b) => b.at.localeCompare(a.at));
  const totals = EVENT.days.map((d) => {
    const rows = rsvps.filter((r) => r.day === d.id);
    return { ...d, replies: rows.length, people: rows.reduce((n, r) => n + r.guests, 0) };
  });
  const allPeople = rsvps.reduce((n, r) => n + r.guests, 0);
  const later = rsvps
    .filter((r) => r.day === "later" && r.laterDate)
    .reduce((m, r) => ({ ...m, [r.laterDate]: (m[r.laterDate] || 0) + r.guests }), {});

  return (
    <main className="guests">
      <div className="admin-bar">
        <h1>Admin</h1>
        <div className="admin-actions">
          <a className="link-btn" href="/admin/export">Download CSV</a>
          <form action={logout}>
            <button className="link-btn" type="submit">Sign out</button>
          </form>
        </div>
      </div>

      <div className="totals">
        <div className="total">
          <p className="total-num">{allPeople}</p>
          <p>people in total ({rsvps.length} {rsvps.length === 1 ? "reply" : "replies"})</p>
        </div>
        {totals.map((t) => (
          <div key={t.id} className="total">
            <p className="total-num">{t.people}</p>
            <p>
              people on {t.label} ({t.replies} {t.replies === 1 ? "reply" : "replies"})
            </p>
          </div>
        ))}
      </div>

      {Object.keys(later).length > 0 && (
        <p>
          Visiting after the function:{" "}
          {Object.entries(later)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([d, n]) => `${d} (${n})`)
            .join(", ")}
        </p>
      )}

      {rsvps.length === 0 ? (
        <p>No replies yet. Share the invite link to start collecting them.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Day</th><th>People</th><th>Replied</th><th></th></tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    {EVENT.days.find((d) => d.id === r.day)?.label || r.day}
                    {r.laterDate ? `: ${r.laterDate}` : ""}
                  </td>
                  <td>{r.guests}</td>
                  <td>{new Date(r.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                  <td>
                    <form action={remove}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="link-btn" type="submit">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
