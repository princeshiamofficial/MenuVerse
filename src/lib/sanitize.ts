/**
 * Trims and sanitizes user-generated string inputs to prevent HTML/XSS injection attacks.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "");
}

/**
 * Validates Base64 image payload size (<= 5MB) and MIME format.
 */
export function validateImagePayload(base64String: string): { valid: boolean; mimeType: string } {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("Invalid image payload");
  }

  // 5MB limit check (~7MB in base64 string encoding)
  if (base64String.length > 7 * 1024 * 1024) {
    throw new Error("File size exceeds maximum allowed limit of 5MB.");
  }

  const mimeMatch = base64String.match(/^data:(image\/(?:jpeg|png|webp|gif|svg\+xml));base64,/i);
  if (base64String.startsWith("data:") && !mimeMatch) {
    throw new Error("Invalid image format. Supported formats: JPEG, PNG, WEBP, GIF, SVG.");
  }

  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  return { valid: true, mimeType };
}
