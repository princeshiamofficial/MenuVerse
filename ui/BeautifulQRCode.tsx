"use client";

import React, { useEffect, useRef, useState } from "react";

interface BeautifulQRCodeProps {
  value: string;
  tableName?: string;
  logoUrl?: string;
  size?: number;
}

export default function BeautifulQRCode({ value, tableName, logoUrl, size = 150 }: BeautifulQRCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [QRCodeStyling, setQRCodeStyling] = useState<any>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR errors
    import("qr-code-styling").then((mod) => {
      setQRCodeStyling(() => mod);
    });
  }, []);

  useEffect(() => {
    if (!QRCodeStyling || !ref.current) return;

    // Use Chrome Dino silhouette in the center to look exactly like Chrome's QR code
    const imageSrc = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Chrome_dino.png";

    // 2. Initialize QRCodeStyling
    const Creator = QRCodeStyling.default || QRCodeStyling;
    const qrCode = new Creator({
      width: size,
      height: size,
      type: "svg",
      data: value,
      image: imageSrc,
      dotsOptions: {
        color: "#000000",
        type: "dots" // Circular dots!
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 2,
        imageSize: 0.2
      },
      cornersSquareOptions: {
        color: "#000000",
        type: "extra-rounded" // Rounded square corner finders
      },
      cornersDotOptions: {
        color: "#000000",
        type: "dot" // Inner finder dots
      }
    });

    ref.current.innerHTML = "";
    qrCode.append(ref.current);
  }, [QRCodeStyling, value, tableName, logoUrl, size]);

  return <div ref={ref} className="flex items-center justify-center select-none" />;
}
