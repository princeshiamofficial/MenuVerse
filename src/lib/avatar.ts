const GOOGLE_AVATAR_COLORS = [
  "#1a73e8", // Google Blue
  "#0f9d58", // Google Green
  "#db4437", // Google Red
  "#f4b400", // Google Yellow
  "#ab47bc", // Purple
  "#00acc1", // Cyan
  "#f4511e", // Deep Orange
  "#5e35b1", // Deep Purple
  "#3f51b5", // Indigo
  "#00897b", // Teal
];

export function getGoogleAvatarColor(name: string): string {
  if (!name) return GOOGLE_AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GOOGLE_AVATAR_COLORS.length;
  return GOOGLE_AVATAR_COLORS[index];
}

export function getAuthorInitial(name: string): string {
  if (!name) return "G";
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    if ((parts[0].toLowerCase() === "md" || parts[0].toLowerCase() === "md.") && parts[1]) {
      return parts[1][0].toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  return clean[0].toUpperCase();
}
