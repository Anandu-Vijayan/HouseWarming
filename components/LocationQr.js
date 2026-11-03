"use client";
import { QRCodeSVG } from "qrcode.react";

export default function LocationQr({ url }) {
  return (
    <div className="qr">
      <QRCodeSVG value={url} size={176} level="M" bgColor="#FAFAF7" fgColor="#1C2A33" marginSize={2} title="Scan for directions" />
    </div>
  );
}
