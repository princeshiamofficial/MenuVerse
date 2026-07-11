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
      setQRCodeStyling(mod);
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
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#ff7a00" stroke-width="6" />
          <text x="50" y="52" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="#0f172a" text-anchor="middle" dominant-baseline="central">
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
    const qrCode = new QRCodeStyling.default({
      width: size,
      height: size,
      type: "svg",
      data: value,
      image: imageSrc,
      dotsOptions: {
        color: "#0f172a",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: 0.4
      },
      cornersSquareOptions: {
        color: "#0f172a",
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "#0f172a",
        type: "dot"
      }
    });

    ref.current.innerHTML = "";
    qrCode.append(ref.current);
  }, [QRCodeStyling, value, tableName, logoUrl, size]);

  return <div ref={ref} className="flex items-center justify-center select-none" />;
}
