"use client";

import QRCode from "react-qr-code";

type QrCodePreviewProps = {
  value: string;
};

export function QrCodePreview({ value }: QrCodePreviewProps) {
  return (
    <div className="inline-flex rounded-xl bg-white p-4">
      <QRCode value={value} size={220} />
    </div>
  );
}
