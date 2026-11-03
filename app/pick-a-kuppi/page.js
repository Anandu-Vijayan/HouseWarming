import { listKuppiVotes } from "@/lib/store";
import KuppiPoll from "@/components/KuppiPoll";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pick a Kuppi", robots: { index: false } };

export default async function PickAKuppi() {
  let votes = [];
  try {
    votes = await listKuppiVotes();
  } catch (e) {
    console.error(e);
  }
  return (
    <main className="kuppi">
      <KuppiPoll initial={votes} />
    </main>
  );
}
