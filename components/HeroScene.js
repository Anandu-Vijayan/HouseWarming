"use client";
import { useEffect, useRef } from "react";
import Fireflies from "./Fireflies";
import House3D from "./House3D";

// Holds the photo and the illustration on one box (same size, same parallax)
// and feeds scroll and pointer position to the hero as CSS variables.
export default function HeroScene({ art, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const hero = ref.current.parentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const set = (k, v) => hero.style.setProperty(k, v);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        set("--sy", Math.min(window.scrollY, window.innerHeight * 1.2).toFixed(1));
      });
    };
    const onMove = (e) => {
      set("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      set("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const fine = matchMedia("(pointer: fine)").matches;
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="stage" ref={ref}>
      <div className="scene">{children}</div>
      <div className="scene scene-art" aria-hidden="true">{art}</div>
      <House3D />
      <Fireflies />
    </div>
  );
}
