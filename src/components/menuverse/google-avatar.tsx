import React, { useState } from "react";
import { getGoogleAvatarColor, getAuthorInitial } from "@/lib/avatar";

interface GoogleAvatarProps {
  author: string;
  src?: string;
  sizeClassName?: string;
}

export function GoogleAvatar({
  author,
  src,
  sizeClassName = "w-10 h-10 text-sm",
}: GoogleAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initial = getAuthorInitial(author);
  const bgColor = getGoogleAvatarColor(author);

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 relative select-none font-bold flex items-center justify-center text-white shadow-sm border border-black/5 ${sizeClassName}`}
      style={{ backgroundColor: bgColor }}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt={author}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="leading-none drop-shadow-xs font-sans">{initial}</span>
      )}
    </div>
  );
}
