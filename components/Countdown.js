"use client";
import { useEffect, useState } from "react";

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const UNITS = [
  ["days", "days"],
  ["hours", "hours"],
  ["minutes", "min"],
  ["seconds", "sec"],
];

export default function Countdown({ target }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now !== null && now >= end) {
    return <p className="cd-open">The door is open. Come on in.</p>;
  }

  const p = now === null ? null : parts(end - now);

  return (
    <div className="cd" role="timer" aria-label="Time until the housewarming">
      {UNITS.map(([key, label]) => (
        <div className="cd-cell" key={key}>
          <span className="cd-num">{p ? String(p[key]).padStart(2, "0") : "--"}</span>
          <span className="cd-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
