"use client";
import { useEffect, useRef } from "react";

// A few warm motes drifting up, like sparks from the lamps. Pauses off-screen.
export default function Fireflies() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    let w = 0, h = 0, raf = 0;
    let ps = [];

    const make = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.8 + Math.random() * 1.8,
      vy: 0.15 + Math.random() * 0.45,
      ph: Math.random() * 6.28,
      sp: 0.01 + Math.random() * 0.02,
    });

    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 600 ? 16 : 30;
      ps = Array.from({ length: n }, () => make(true));
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.ph += p.sp;
        p.y -= p.vy;
        p.x += Math.sin(p.ph) * 0.35;
        if (p.y < -10) ps[i] = make(false);
        const a = (0.35 + 0.65 * Math.abs(Math.sin(p.ph * 2))) * Math.min(1, (h - p.y) / 120);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,214,140,${Math.max(0, a * 0.85).toFixed(3)})`;
        ctx.shadowColor = "rgba(243,199,123,.9)";
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
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

  return <canvas className="fireflies" ref={ref} aria-hidden="true" />;
}
