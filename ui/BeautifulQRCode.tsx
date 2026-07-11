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

    // 1. Generate center image
    let imageSrc = "";
    if (tableName) {
      const cleanNum = tableName.replace("Table ", "");
      // Generate a beautiful SVG representing the table number
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#000000" stroke-width="8" />
          <text x="50" y="52" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="#000000" text-anchor="middle" dominant-baseline="central">
            ${cleanNum}
          </text>
        </svg>
      `;
      imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
    } else if (logoUrl) {
      imageSrc = logoUrl;
    } else {
      // Fallback to the beautiful Chrome-like Dino logo silhouette if nothing is provided
      imageSrc = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Chrome_dino.png";
    }

    // 2. Initialize QRCodeStyling
    const Creator = QRCodeStyling.default || QRCodeStyling;
    const qrCode = new Creator({
      width: size,
      height: size,
      margin: 10,
      type: "svg",
      data: value,
      image: imageSrc,
      dotsOptions: {
        color: "#000000",
        type: "dots"
      },
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H"
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 2,
        imageSize: 0.22
      },
      cornersSquareOptions: {
        color: "#000000",
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "#000000",
        type: "dot"
      }
    });

    ref.current.innerHTML = "";
    qrCode.append(ref.current);
  }, [QRCodeStyling, value, tableName, logoUrl, size]);

  return <div ref={ref} className="flex items-center justify-center select-none" />;
}
