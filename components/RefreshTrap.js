"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const KEY = "fc-reloads";
const WINDOW_MS = 15000;
const LIMIT = 5;

// Five quick refreshes of the invite open the hidden "Pick a Kuppi" poll.
export default function RefreshTrap() {
  const router = useRouter();
  useEffect(() => {
    if (performance.getEntriesByType("navigation")[0]?.type !== "reload") return;
    try {
      const now = Date.now();
      const hits = JSON.parse(sessionStorage.getItem(KEY) || "[]").filter((t) => now - t < WINDOW_MS);
      // Dev strict mode runs effects twice; ignore a second hit within the same instant.
      if (hits.length && now - hits[hits.length - 1] < 400) return;
      hits.push(now);
      if (hits.length >= LIMIT) {
        sessionStorage.removeItem(KEY);
        router.push("/pick-a-kuppi");
        return;
      }
      sessionStorage.setItem(KEY, JSON.stringify(hits));
    } catch {}
  }, [router]);
  return null;
}
