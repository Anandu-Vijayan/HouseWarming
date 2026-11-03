// Edit everything about the event here.
export const EVENT = {
  hosts: "Anandu & Family",
  title: "Housewarming",
  titleMalayalam: "ഗൃഹപ്രവേശം",
  // 9:00 AM IST, 29 November 2026
  startISO: "2026-11-29T09:00:00+05:30",
  dateLabel: "Sunday, 29 November 2026",
  timeLabel: "9:00 AM onwards",
  mapUrl: "https://maps.app.goo.gl/qfaaGGwGnFsGMkdx6",
  note: "We have built a home, and it would mean a lot to have you there on the first morning. Come for the ceremony, stay for lunch.",
  // Days a guest can pick in the RSVP form
  days: [
    { id: "2026-11-28", label: "Sat, 28 Nov", sub: "Evening, the day before" },
    { id: "2026-11-29", label: "Sun, 29 Nov", sub: "Main function, from 9 AM" },
    { id: "later", label: "After the function", sub: "I will visit on another day", later: true },
  ],
  // Earliest date a guest can pick under "After the function"
  laterMinDate: "2026-11-30",
};
