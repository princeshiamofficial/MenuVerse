import React from "react";

export interface DiscountBadgeProps extends React.SVGProps<SVGSVGElement> {
  value?: string | number;
  subtext?: string;
  badgeColor?: string;
  textColor?: string;
  size?: number | string;
  className?: string;
}

export function DiscountBadge({
  value = "20%",
  subtext = "PRICE OFF",
  badgeColor = "#EB3E1B",
  textColor = "#FFFFFF",
  size,
  className = "",
  style,
  ...props
}: DiscountBadgeProps) {
  const displayText = typeof value === "number" ? `${value}%` : value;

  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none shrink-0 drop-shadow-sm ${className}`}
      style={{ ...style }}
      aria-label={`${displayText} ${subtext}`}
      role="img"
      {...props}
    >
      {/* Speech bubble badge path matching reference image */}
      <path
        d="M 95,192 C 86,152 20,132 20,78 C 20,35 55,10 105,10 H 165 C 206,10 236,40 236,78 C 236,118 206,148 165,148 C 128,148 108,160 95,192 Z"
        fill={badgeColor}
      />

      {/* Percentage / Discount Value */}
      <text
        x="130"
        y="82"
        textAnchor="middle"
        fill={textColor}
        fontSize="64"
        fontWeight="300"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        {displayText}
      </text>

      {/* Subtext e.g. PRICE OFF */}
      <text
        x="130"
        y="124"
        textAnchor="middle"
        fill={textColor}
        fontSize="24"
        fontWeight="600"
        letterSpacing="1.2"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        {subtext}
      </text>
    </svg>
  );
}
