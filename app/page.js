import Image from "next/image";
import { EVENT } from "@/lib/event";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import LocationQr from "@/components/LocationQr";

function calendarUrl() {
  const start = new Date(EVENT.startISO);
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.title} at ${EVENT.hosts.replace(" & Family", "")}'s new home`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Directions: ${EVENT.mapUrl}`,
    location: EVENT.mapUrl,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Image
          src="/house.png"
          alt="Our new home at dusk, white walls with wooden frames and warm wall lights"
          fill
          priority
          sizes="100vw"
          className="hero-img"
        />
        <div className="hero-top">
          <p className="hero-hosts">{EVENT.hosts} invite you to our</p>
          <h1>
            <span className="ml" lang="ml">{EVENT.titleMalayalam}</span>
            <span className="en">{EVENT.title}</span>
          </h1>
        </div>
        <div className="hero-bottom">
          <p className="hero-when">
            {EVENT.dateLabel}, {EVENT.timeLabel}
          </p>
          <Countdown target={EVENT.startISO} />
          <a href="#rsvp" className="btn btn-glow">Reply to the invite</a>
        </div>
      </section>

      <section className="details" id="rsvp">
        <div className="details-text">
          <h2>Come home with us</h2>
          <p className="lede">{EVENT.note}</p>
          <dl className="facts">
            <div>
              <dt>Date</dt>
              <dd>{EVENT.dateLabel}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{EVENT.timeLabel}</dd>
            </div>
          </dl>
          <a className="link-btn" href={calendarUrl()} target="_blank" rel="noopener noreferrer">
            Add to Google Calendar
          </a>
        </div>

        <div className="details-form">
          <h2 className="form-title">Let us know you are coming</h2>
          <RsvpForm days={EVENT.days} laterMinDate={EVENT.laterMinDate} />
        </div>
      </section>

      <section className="location">
        <LocationQr url={EVENT.mapUrl} />
        <div className="location-text">
          <h2>Finding the house</h2>
          <p>Scan the code with your phone camera for directions, or open the map below.</p>
          <a className="btn" href={EVENT.mapUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
      </section>

      <footer className="foot">
        <p>With love, {EVENT.hosts}</p>
      </footer>
    </main>
  );
}
