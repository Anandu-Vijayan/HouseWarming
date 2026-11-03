"use client";
import { useEffect, useRef } from "react";

// Loads the 3D house after hydration. Anything that goes wrong (no WebGL, slow
// load, lost context) falls back to the photo with the 2D illustration.
export default function House3D() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas.closest(".hero");
    const ready = (use3d) => {
      hero.classList.remove("pending");
      hero.classList.add("play");
      hero.classList.toggle("has-3d", use3d);
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hero.classList.remove("pending");
      return;
    }
    let gl = null;
    try {
      gl = document.createElement("canvas").getContext("webgl2");
    } catch {}
    if (!gl) {
      ready(false);
      return;
    }

    let dead = false;
    let api = null;
    const timer = setTimeout(() => {
      dead = true;
      ready(false);
    }, 6000);

    (async () => {
      try {
        const { createHouse } = await import("@/lib/house3d");
        if (dead) return;
        api = createHouse(canvas, hero, { onLost: () => ready(false) });
        clearTimeout(timer);
        ready(true);
        api.start();
        if (location.search.includes("debug3d")) window.__house3d = api;
      } catch (e) {
        console.error(e);
        if (!dead) {
          clearTimeout(timer);
          ready(false);
        }
      }
    })();

    const onReplay = () => api?.replay();
    window.addEventListener("hero:replay", onReplay);
    return () => {
      dead = true;
      clearTimeout(timer);
      window.removeEventListener("hero:replay", onReplay);
      api?.dispose();
    };
  }, []);

  return <canvas ref={ref} className="house3d" aria-hidden="true" />;
}
