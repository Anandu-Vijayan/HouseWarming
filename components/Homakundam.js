"use client";
import { useEffect, useRef, useState } from "react";
import Ornament from "./Ornament";

const FLAME = "M0 0 C-34 -6 -44 -44 -20 -78 C-12 -92 -2 -104 0 -130 C6 -104 22 -90 30 -66 C44 -34 30 -4 0 0Z";

export default function Homakundam() {
  const sec = useRef(null);
  const cv = useRef(null);
  const burst = useRef(() => {});
  const heatRef = useRef(0);
  const timer = useRef(0);
  const [lit, setLit] = useState(false);
  const [offers, setOffers] = useState(0);
  const [flare, setFlare] = useState(false);

  const heat = lit ? Math.min(1, 0.5 + offers * 0.12) : 0;
  heatRef.current = heat;

  // Fire lights when the section scrolls into view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLit(true), { threshold: 0.35 });
    io.observe(sec.current);
    return () => io.disconnect();
  }, []);

  // Embers: canvas particles, paused when off-screen.
  useEffect(() => {
    const c = cv.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    let w = 0, h = 0, raf = 0;
    const ps = [];

    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (n, k = 1) => {
      for (let i = 0; i < n; i++) {
        ps.push({
          x: w * 0.5 + (Math.random() - 0.5) * w * 0.14,
          y: h * 0.74 - Math.random() * h * 0.06,
          vx: (Math.random() - 0.5) * 0.7 * k,
          vy: -(0.6 + Math.random() * 1.3) * k,
          life: 0,
          max: 60 + Math.random() * 80,
          r: 0.8 + Math.random() * 1.8,
        });
      }
      if (ps.length > 200) ps.splice(0, ps.length - 200);
    };
    burst.current = (n) => spawn(n, 1.6);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      if (heatRef.current > 0 && Math.random() < 0.3 * heatRef.current) spawn(1);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (++p.life > p.max) {
          ps.splice(i, 1);
          continue;
        }
        p.x += p.vx + Math.sin((p.life + i) * 0.08) * 0.3;
        p.y += p.vy;
        p.vy *= 0.996;
        const a = 1 - p.life / p.max;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,${150 + Math.round(a * 80)},70,${(a * 0.9).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r * a + 0.3, 0, 6.2832);
        ctx.fill();
      }
    };

    size();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(c);
    const ro = new ResizeObserver(size);
    ro.observe(c);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  function offer() {
    setLit(true);
    setOffers((o) => o + 1);
    setFlare(true);
    burst.current(36);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlare(false), 700);
  }

  return (
    <section className="kundam" id="kundam" ref={sec} aria-labelledby="kundam-title">
      <div className="kundam-inner">
        <p className="eyebrow" data-reveal>A new beginning</p>
        <h2 id="kundam-title" data-reveal style={{ "--i": 1 }}>Every home begins with a flame</h2>
        <Ornament />
        <p className="kundam-lede" data-reveal style={{ "--i": 2 }}>
          Offer a little ghee and watch the fire rise. We would love you to be there when we light the real one.
        </p>

        <figure className="fire" style={{ "--heat": heat, "--fl": flare ? 0.22 : 0 }}>
          <svg viewBox="0 0 400 300" role="img" aria-label="A homa kundam with a burning fire">
            <defs>
              <radialGradient id="fireGlow">
                <stop offset="0" stopColor="#F3C77B" stopOpacity="0.55" />
                <stop offset="0.5" stopColor="#E8731A" stopOpacity="0.18" />
                <stop offset="1" stopColor="#E8731A" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="bed">
                <stop offset="0" stopColor="#FFB347" />
                <stop offset="1" stopColor="#B8400E" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle className="fire-glow" cx="200" cy="190" r="190" fill="url(#fireGlow)" />

            <polygon points="60,240 340,240 384,284 16,284" fill="#9A5A33" />
            <polygon points="16,284 384,284 384,298 16,298" fill="#5E3520" />
            <polygon points="112,208 288,208 330,246 70,246" fill="#B8714A" />
            <polygon points="70,246 330,246 330,258 70,258" fill="#75462B" />
            <polygon points="128,215 272,215 306,243 94,243" fill="#2A1A12" />
            <ellipse cx="200" cy="236" rx="74" ry="11" fill="url(#bed)" />
            <rect x="150" y="228" width="100" height="11" rx="5.5" fill="#3B2216" transform="rotate(-8 200 233)" />
            <rect x="152" y="229" width="96" height="11" rx="5.5" fill="#4A2B1A" transform="rotate(9 200 234)" />

            <g transform="translate(200 236)">
              <g className="flame">
                <path className="flick flick-a" d={FLAME} fill="#E8731A" />
                <g transform="scale(.72)">
                  <path className="flick flick-b" d={FLAME} fill="#F2A11B" />
                </g>
                <g transform="scale(.42)">
                  <path className="flick flick-c" d={FLAME} fill="#FFE08A" />
                </g>
              </g>
            </g>
          </svg>
          <canvas ref={cv} aria-hidden="true" />
        </figure>

        <button type="button" className="btn btn-glow" onClick={offer}>
          Offer ghee
        </button>
        <p className="kundam-count" aria-live="polite">
          {offers === 0 ? "Tap to offer ghee" : `${offers} ${offers === 1 ? "offering" : "offerings"}`}
        </p>
        {offers >= 3 && (
          <p className="blessing">
            <span className="ml" lang="ml">ശുഭം</span>
            May this home be full of light.
          </p>
        )}
      </div>
    </section>
  );
}
