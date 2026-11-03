"use client";
import { useState } from "react";

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
      setError("Enter your name.");
      return;
    }
    if (day === "later" && !laterDate) {
      setError("Pick the date you plan to visit.");
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
      if (!res.ok) throw new Error(data.error || "Could not save your reply.");
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
        <p className="rsvp-done-title">Thank you, {name.trim().split(" ")[0]}.</p>
        <p>
          We have you down for {day === "later" ? `${laterDate} (after the function)` : chosen.label}
          {guests > 1 ? `, ${guests} people` : ""}. See you there.
        </p>
        <button type="button" className="link-btn" onClick={() => setStatus("idle")}>
          Change my reply
        </button>
      </div>
    );
  }

  return (
    <form className="rsvp" onSubmit={send} noValidate>
      <label className="field">
        <span>Your name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={80}
          placeholder="Full name"
          required
        />
      </label>

      <fieldset className="field">
        <legend>Which day are you coming?</legend>
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
            <span>Which date are you planning to come?</span>
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
        <span id="guests-label">How many of you?</span>
        <div className="stepper" role="group" aria-labelledby="guests-label">
          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="One less">
            −
          </button>
          <output aria-live="polite">{guests}</output>
          <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="One more">
            +
          </button>
        </div>
      </div>

      {error && <p className="err" role="alert">{error}</p>}

      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send my reply"}
      </button>
    </form>
  );
}
