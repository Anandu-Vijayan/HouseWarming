import "./globals.css";
import { EVENT } from "@/lib/event";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: `${EVENT.title} | ${EVENT.hosts}`,
  description: `${EVENT.hosts} invite you to our housewarming on ${EVENT.dateLabel}, ${EVENT.timeLabel}.`,
  openGraph: {
    title: `You're invited: ${EVENT.title}`,
    description: `${EVENT.dateLabel}, ${EVENT.timeLabel}`,
    images: ["/house.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1C2A33",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Noto+Serif+Malayalam:wght@500;700&family=Young+Serif&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
