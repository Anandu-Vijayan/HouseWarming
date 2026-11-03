"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BRANDS, PEG_ML, BOTTLE_ML, PEGS_PER_BOTTLE as N } from "@/lib/kuppi";

const FULL_MS = 900; // bottle glows before it leaves
const STORE_MS = 2600; // bottle travels into the locker, door closes
const POLL_MS = 10000;

// Bottle geometry (SVG units): liquid spans BOTTOM (0 ml) to TOP (750 ml).
const BOTTOM = 362;
const TOP = 60;
const BOTTLE_PATH =
  "M64 14H96V30H92V98C92 128 142 138 142 180V342Q142 362 122 362H38Q18 362 18 342V180C18 138 68 128 68 98V30H64Z";
const MINI_PATH = "M7 1H13V5H12V12C12 16 18 17 18 23V47Q18 50 15 50H5Q2 50 2 47V23C2 17 8 16 8 12V5H7Z";

const byId = Object.fromEntries(BRANDS.map((b) => [b.id, b]));
const yFor = (ml) => BOTTOM - (ml / BOTTLE_ML) * (BOTTOM - TOP);

// Votes in a bottle -> brand segments, bottom first, in order of first pour.
function layers(votes) {
  const order = [];
  const count = {};
  for (const id of votes) {
    if (!(id in count)) {
      count[id] = 0;
      order.push(id);
    }
    count[id] += 1;
  }
  let cum = 0;
  return order.map((id) => {
    cum += count[id] * PEG_ML;
    return { id, top: yFor(cum) };
  });
}

function dominant(votes) {
  const count = {};
  for (const id of votes) count[id] = (count[id] || 0) + 1;
  return Object.keys(count).sort((a, b) => count[b] - count[a])[0];
}

export default function KuppiPoll({ initial }) {
  const [votes, setVotes] = useState(initial);
  const [phase, setPhase] = useState("idle"); // idle | full | storing
  const [sending, setSending] = useState(false);
  const [pour, setPour] = useState(null);
  const [error, setError] = useState("");
  const timers = useRef([]);

  const busy = phase !== "idle";
  const lockedAll = Math.floor(votes.length / N);
  // While a full bottle is leaving it is still shown; the locker counts it afterwards.
  const lockedShown = busy ? lockedAll - 1 : lockedAll;
  const current = busy ? votes.slice(lockedAll * N - N, lockedAll * N) : votes.slice(lockedAll * N);
  const ml = current.length * PEG_ML;
  const lockedBottles = Array.from({ length: lockedShown }, (_, i) => dominant(votes.slice(i * N, i * N + N)));

  const tally = {};
  for (const id of votes) tally[id] = (tally[id] || 0) + 1;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Pick up other guests' votes while nothing is animating.
  useEffect(() => {
    if (busy || sending) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/kuppi", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setVotes((v) => (data.votes.length > v.length ? data.votes : v));
      } catch {}
    }, POLL_MS);
    return () => clearInterval(t);
  }, [busy, sending]);

  async function vote(b) {
    if (busy || sending) return;
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/kuppi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: b.id }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "വോട്ട് രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല.");
      const next = [...votes, b.id];
      setVotes(next);
      setPour({ color: b.color, n: next.length, ml: (next.length % N || N) * PEG_ML });
      timers.current.push(setTimeout(() => setPour(null), 900));
      if (next.length % N === 0) {
        setPhase("full");
        timers.current.push(setTimeout(() => setPhase("storing"), FULL_MS));
        timers.current.push(setTimeout(() => setPhase("idle"), FULL_MS + STORE_MS));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  const stack = layers(current);
  const ticks = [150, 300, 450, 600, 750];

  return (
    <div className="kuppi-inner">
      <p className="eyebrow">ഗൃഹപ്രവേശം സ്പെഷ്യൽ</p>
      <h1>Pick a Kuppi</h1>
      <p className="kuppi-lede">
        ഇത്ര വേഗം റിഫ്രഷ് ചെയ്യല്ലേ! ഏത് കുപ്പിയാണ് വേണ്ടത് എന്ന് വോട്ട് ചെയ്യൂ. ഓരോ വോട്ടിനും {PEG_ML} മില്ലി കുപ്പിയിൽ നിറയും.
        {" "}{BOTTLE_ML} മില്ലി ആകുമ്പോൾ കുപ്പി ലോക്കറിലേക്ക് പോകും.
      </p>

      <div className="kuppi-stage">
        <figure
          key={lockedShown}
          className={`bottle ${phase === "full" ? "is-full" : ""} ${phase === "storing" ? "is-storing" : ""}`}
        >
          <svg viewBox="-34 0 214 380" role="img" aria-label={`കുപ്പിയിൽ ${ml} മില്ലി`}>
            <defs>
              <clipPath id="kuppi-clip">
                <path d={BOTTLE_PATH} />
              </clipPath>
            </defs>
            <path d={BOTTLE_PATH} fill="rgba(255,255,255,.07)" />
            <g clipPath="url(#kuppi-clip)">
              {/* Highest layer first: each one runs down to the base, lower layers paint over it. */}
              {[...stack].reverse().map((l) => (
                <rect
                  key={l.id}
                  x="0"
                  y={TOP}
                  width="160"
                  height={BOTTOM - TOP + 4}
                  fill={byId[l.id].color}
                  className="kuppi-layer"
                  style={{ transform: `translateY(${l.top - TOP}px)` }}
                />
              ))}
              {ml > 0 && (
                <rect
                  x="0"
                  y={yFor(ml) - 2}
                  width="160"
                  height="3"
                  fill="rgba(255,255,255,.45)"
                  className="kuppi-layer"
                  style={{ transform: "translateY(0)" }}
                />
              )}
            </g>
            <path d={BOTTLE_PATH} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
            <path d="M30 190V330" stroke="rgba(255,255,255,.3)" strokeWidth="5" strokeLinecap="round" />
            <rect x="62" y="4" width="36" height="12" rx="3" fill="#F3C77B" />
            {ticks.map((t) => (
              <g key={t}>
                <line x1="-4" x2="8" y1={yFor(t)} y2={yFor(t)} stroke="rgba(250,250,247,.6)" strokeWidth="1.5" />
                <text x="-8" y={yFor(t) + 4} textAnchor="end" fontSize="11" fill="rgba(250,250,247,.7)">
                  {t}
                </text>
              </g>
            ))}
            {pour && (
              <rect
                key={pour.n}
                x="77"
                y="0"
                width="6"
                height={yFor(pour.ml)}
                fill={pour.color}
                className="kuppi-stream"
              />
            )}
          </svg>
        </figure>

        <div className={`locker ${phase === "storing" ? "is-storing" : ""}`}>
          <p className="locker-title">ലോക്കർ</p>
          <div className="locker-box">
            <div className="locker-shelf">
              {lockedBottles.slice(-12).map((id, i) => (
                <svg key={i} viewBox="0 0 20 52" className="mini" aria-hidden="true">
                  <path d={MINI_PATH} fill={byId[id].color} stroke="rgba(255,255,255,.5)" strokeWidth="1" />
                </svg>
              ))}
            </div>
            <div className="locker-door" aria-hidden="true">
              <span className="locker-vents" />
              <svg className="locker-lock" viewBox="0 0 24 28">
                <rect x="3" y="12" width="18" height="14" rx="3" fill="#F3C77B" />
                <path d="M7 12V8a5 5 0 0 1 10 0v4" fill="none" stroke="#F3C77B" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
          <p className="locker-count">{lockedShown === 0 ? "ലോക്കർ കാലി" : `${lockedShown} കുപ്പി ലോക്കറിൽ`}</p>
        </div>
      </div>

      <p className="kuppi-ml" aria-live="polite">
        {phase === "full" || phase === "storing" ? `${BOTTLE_ML} മില്ലി നിറഞ്ഞു! ലോക്കറിലേക്ക്...` : `${ml} / ${BOTTLE_ML} മില്ലി`}
      </p>

      <div className="kuppi-brands">
        {BRANDS.map((b) => {
          const n = tally[b.id] || 0;
          const share = votes.length ? Math.round((n / votes.length) * 100) : 0;
          return (
            <button
              key={b.id}
              type="button"
              className="brand"
              onClick={() => vote(b)}
              disabled={busy || sending}
              style={{ "--c": b.color }}
            >
              <span className="brand-dot" />
              <span className="brand-name">{b.name}</span>
              <span className="brand-kind">{b.kind}</span>
              <span className="brand-n">{n} വോട്ട്</span>
              <span className="brand-bar">
                <span style={{ width: `${share}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="err" role="alert">{error}</p>}
      <p className="kuppi-note">18 വയസ്സിന് മുകളിലുള്ളവർക്ക് മാത്രം. മദ്യപിച്ച് വാഹനം ഓടിക്കരുത്.</p>
      <Link href="/" className="link-btn">ക്ഷണത്തിലേക്ക് മടങ്ങുക</Link>
    </div>
  );
}
