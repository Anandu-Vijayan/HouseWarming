"use client";
import { useState } from "react";

// "2026-12-05" -> "5 ഡിസംബർ 2026"; UTC so the day never shifts with the viewer's timezone.
function niceDate(iso) {
  return new Date(iso).toLocaleDateString("ml-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function RsvpForm({ days, laterMinDate }) {
  const [name, setName] = useState("");
  const [day, setDay] = useState(days.filter((d) => !d.later).slice(-1)[0].id);
  const [laterDate, setLaterDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function send(e) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("നിങ്ങളുടെ പേര് നൽകുക.");
      return;
    }
    if (day === "later" && !laterDate) {
      setError("വരാൻ ഉദ്ദേശിക്കുന്ന തീയതി തിരഞ്ഞെടുക്കുക.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, day, guests, laterDate: day === "later" ? laterDate : "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "മറുപടി സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.");
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  if (status === "done") {
    const chosen = days.find((d) => d.id === day);
    return (
      <div className="rsvp-done" role="status">
        <p className="rsvp-done-title">നന്ദി, {name.trim().split(" ")[0]}.</p>
        <p>
          {day === "later" ? niceDate(laterDate) : chosen.label}-ന് നിങ്ങളുടെ പേര്
          ചേർത്തിട്ടുണ്ട്{guests > 1 ? ` (${guests} പേർ)` : ""}. അന്ന് കാണാം.
        </p>
        <button type="button" className="link-btn" onClick={() => setStatus("idle")}>
          മറുപടി മാറ്റുക
        </button>
      </div>
    );
  }

  return (
    <form className="rsvp" onSubmit={send} noValidate>
      <label className="field">
        <span>നിങ്ങളുടെ പേര്</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={80}
          placeholder="മുഴുവൻ പേര്"
          required
        />
      </label>

      <fieldset className="field">
        <legend>ഏത് ദിവസമാണ് വരുന്നത്?</legend>
        <div className="days">
          {days.map((d) => (
            <label key={d.id} className={`day ${day === d.id ? "is-on" : ""}`}>
              <input
                type="radio"
                name="day"
                value={d.id}
                checked={day === d.id}
                onChange={() => setDay(d.id)}
              />
              <span className="day-label">{d.label}</span>
              <span className="day-sub">{d.sub}</span>
            </label>
          ))}
        </div>
        {day === "later" && (
          <label className="later-date">
            <span>ഏത് തീയതിക്കാണ് വരാൻ ഉദ്ദേശിക്കുന്നത്?</span>
            <input
              type="date"
              value={laterDate}
              min={laterMinDate}
              onChange={(e) => setLaterDate(e.target.value)}
              required
            />
          </label>
        )}
      </fieldset>

      <div className="field">
        <span id="guests-label">നിങ്ങൾ എത്ര പേർ വരും?</span>
        <div className="stepper" role="group" aria-labelledby="guests-label">
          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="ഒരാളെ കുറയ്ക്കുക">
            −
          </button>
          <output aria-live="polite">{guests}</output>
          <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="ഒരാളെ കൂട്ടുക">
            +
          </button>
        </div>
      </div>

      {error && <p className="err" role="alert">{error}</p>}

      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "അയയ്ക്കുന്നു…" : "മറുപടി അയയ്ക്കുക"}
      </button>
    </form>
  );
}
