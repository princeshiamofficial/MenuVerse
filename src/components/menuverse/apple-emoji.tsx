import React from "react";
import { cn } from "@/lib/utils";

interface AppleEmojiProps {
  emoji?: string;
  className?: string;
  size?: number;
}

function isEmojiString(str: string): boolean {
  if (!str) return false;
  // Exclude plain ASCII words like "All", "undefined", "Popular"
  if (/^[a-zA-Z0-9\s_-]+$/.test(str)) return false;
  return true;
}

export function AppleEmoji({ emoji, className, size = 18 }: AppleEmojiProps) {
  if (!emoji || !emoji.trim()) return null;

  // If input is not a valid emoji (e.g. "All" or plain text), do not render
  if (!isEmojiString(emoji)) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 align-middle leading-none select-none font-normal",
        className,
      )}
      style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
      aria-label={emoji}
      role="img"
    >
      {emoji}
    </span>
  );
}
