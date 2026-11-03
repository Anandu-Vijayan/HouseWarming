"use client";
import { useEffect, useRef, useState } from "react";

// Page-wide motion in one place so every section behaves the same:
// scroll progress bar, reveal on scroll ([data-reveal]), lamp-light that follows
// the pointer ([data-spot]), and a floating reply button after the hero.
export default function PageMotion() {
  const bar = useRef(null);
  const [heroOn, setHeroOn] = useState(true);
  const [formOn, setFormOn] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("--p", (max > 0 ? window.scrollY / max : 0).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();

    // Only content that starts below the fold is hidden, so nothing flashes.
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.remove("rv-hide");
          reveal.unobserve(e.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    if (!reduced) {
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
          el.classList.add("rv-hide");
          reveal.observe(el);
        }
      });
    }

    const onMove = (e) => {
      const el = e.target.closest?.("[data-spot]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", `${e.clientX - r.left}px`);
      el.style.setProperty("--py", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const watch = (sel, set) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { threshold: 0.2 });
      io.observe(el);
      return io;
    };
    const ios = [watch(".hero", setHeroOn), watch("#rsvp", setFormOn)];

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      reveal.disconnect();
      ios.forEach((io) => io?.disconnect());
    };
  }, []);

  const showCta = !heroOn && !formOn;
  return (
    <>
      <div className="progress" aria-hidden="true">
        <span ref={bar} />
      </div>
      <a href="#rsvp" className={`fab ${showCta ? "is-on" : ""}`} tabIndex={showCta ? 0 : -1} aria-hidden={!showCta}>
        Reply
      </a>
    </>
  );
}
