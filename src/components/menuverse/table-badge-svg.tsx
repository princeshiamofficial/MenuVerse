import React from "react";

export interface TableBadgeSVGProps extends React.SVGProps<SVGSVGElement> {
  tableNumber: string | number;
  className?: string;
}

export function TableBadgeSVG({
  tableNumber,
  className = "w-12 h-14",
  ...props
}: TableBadgeSVGProps) {
  const formattedTable = String(tableNumber).padStart(2, "0");

  return (
    <svg
      viewBox="0 0 60 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none drop-shadow-md ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#D93800" />
        </linearGradient>
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE259" />
          <stop offset="100%" stopColor="#FFA751" />
        </linearGradient>
      </defs>

      {/* Shield Ribbon Container */}
      <path
        d="M6 4C6 2.89543 6.89543 2 8 2H52C53.1046 2 54 2.89543 54 4V52L30 66L6 52V4Z"
        fill="url(#badgeGradient)"
        stroke="url(#goldRim)"
        strokeWidth="2.5"
      />

      {/* Inner Accent Border */}
      <path
        d="M10 6H50V49L30 61L10 49V6Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="1"
      />

      {/* "TABLE" Label */}
      <text
        x="30"
        y="18"
        textAnchor="middle"
        fill="#FFE259"
        fontSize="8"
        fontWeight="800"
        letterSpacing="1.5"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        TABLE
      </text>

      {/* Table Number */}
      <text
        x="30"
        y="42"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="22"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        {formattedTable}
      </text>
    </svg>
  );
}
