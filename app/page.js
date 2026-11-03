import Image from "next/image";
import { EVENT } from "@/lib/event";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import LocationQr from "@/components/LocationQr";
import HeroScene from "@/components/HeroScene";
import HeroArt from "@/components/HeroArt";
import Homakundam from "@/components/Homakundam";
import Ornament from "@/components/Ornament";
import PageMotion from "@/components/PageMotion";
import ReplayButton from "@/components/ReplayButton";
import RefreshTrap from "@/components/RefreshTrap";

function calendarUrl() {
  const start = new Date(EVENT.startISO);
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.title} - ${EVENT.hosts}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `വഴി: ${EVENT.mapUrl}`,
    location: EVENT.mapUrl,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default function Home() {
  return (
    <main>
      <PageMotion />
      <RefreshTrap />
      <section className="hero pending">
        <HeroScene art={<HeroArt />}>
          <Image
            src="/house.png"
            alt="സന്ധ്യാനേരത്ത് ഞങ്ങളുടെ പുതിയ വീട്. വെള്ള ചുവരുകളും തടികൊണ്ടുള്ള ഫ്രെയിമുകളും ചുവരിൽ മഞ്ഞവെളിച്ചം തരുന്ന വിളക്കുകളും കാണാം."
            fill
            priority
            sizes="100vw"
            className="scene-img"
          />
        </HeroScene>
        <div className="hero-top">
          <p className="hero-hosts">{EVENT.hosts} ക്ഷണിക്കുന്നു</p>
          <h1>
            <span className="ml" lang="ml">{EVENT.title}</span>
            <span className="en">{EVENT.tagline}</span>
          </h1>
        </div>
        <div className="hero-bottom">
          <p className="hero-when">
            {EVENT.dateLabel}, {EVENT.timeLabel}
          </p>
          <Countdown target={EVENT.startISO} />
          <a href="#rsvp" className="btn btn-glow">മറുപടി നൽകൂ</a>
          <ReplayButton />
        </div>
      </section>

      <Homakundam />

      <section className="details" id="rsvp">
        <div className="details-text">
          <p className="eyebrow" data-reveal>ക്ഷണം</p>
          <h2 data-reveal style={{ "--i": 1 }}>ഞങ്ങളുടെ പുതിയ വീട്ടിലേക്ക് വരൂ</h2>
          <Ornament />
          <p className="lede" data-reveal style={{ "--i": 2 }}>{EVENT.note}</p>
          <dl className="facts" data-reveal style={{ "--i": 3 }}>
            <div>
              <dt>തീയതി</dt>
              <dd>{EVENT.dateLabel}</dd>
            </div>
            <div>
              <dt>സമയം</dt>
              <dd>{EVENT.timeLabel}</dd>
            </div>
          </dl>
          <a className="link-btn" data-reveal style={{ "--i": 4 }} href={calendarUrl()} target="_blank" rel="noopener noreferrer">
            ഗൂഗിൾ കലണ്ടറിൽ ചേർക്കുക
          </a>
        </div>

        <div className="details-form" data-reveal data-spot style={{ "--i": 2 }}>
          <h2 className="form-title">നിങ്ങൾ വരുന്ന കാര്യം അറിയിക്കൂ</h2>
          <RsvpForm days={EVENT.days} laterMinDate={EVENT.laterMinDate} />
        </div>
      </section>

      <section className="location">
        <div data-reveal>
          <LocationQr url={EVENT.mapUrl} />
        </div>
        <div className="location-text" data-reveal style={{ "--i": 1 }}>
          <p className="eyebrow">സ്ഥലം</p>
          <h2>വീട്ടിലേക്കുള്ള വഴി</h2>
          <Ornament />
          <p>വഴി അറിയാൻ ഫോൺ ക്യാമറ ഉപയോഗിച്ച് ഈ കോഡ് സ്കാൻ ചെയ്യുക, അല്ലെങ്കിൽ താഴെയുള്ള ബട്ടൺ അമർത്തി മാപ്പ് തുറക്കുക.</p>
          <a className="btn" href={EVENT.mapUrl} target="_blank" rel="noopener noreferrer">
            ഗൂഗിൾ മാപ്സിൽ തുറക്കുക
          </a>
        </div>
      </section>

      <footer className="foot">
        <p>സ്നേഹത്തോടെ, {EVENT.hosts}</p>
      </footer>
    </main>
  );
}
