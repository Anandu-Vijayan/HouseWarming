"use client";

// Restarts the hero story: drop the .play class, force a reflow, add it back.
export default function ReplayButton() {
  function replay() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    hero.classList.remove("play");
    void hero.offsetWidth;
    hero.classList.add("play");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <button type="button" className="replay" onClick={replay}>
      Watch the story again
    </button>
  );
}
