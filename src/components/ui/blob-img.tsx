import type { ComponentPropsWithoutRef } from "react";

type BlobImgProps = ComponentPropsWithoutRef<"img"> & {
  src?: string | null;
};

/**
 * Standard image component for rendering images directly.
 */
export function BlobImg({ src, alt, ...props }: BlobImgProps) {
  if (!src) return null;
  return <img src={src} alt={alt ?? ""} {...props} />;
}
