export interface GoogleReview {
  author: string;
  date: string;
  stars: number;
  text: string;
  avatar: string;
  ownerReply?: string;
  isGoogleMap?: boolean;
}

export const COLOR_HUT_GOOGLE_MAPS_REVIEWS: GoogleReview[] = [];

export const GOOGLE_MAPS_REVIEWS: GoogleReview[] = COLOR_HUT_GOOGLE_MAPS_REVIEWS;

export const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/esG9Vkaf3MiRy1Ne9";

export function getGoogleRatingSummary(reviews: GoogleReview[] = []) {
  const target = reviews || [];
  const total = target.length;

  if (total === 0) {
    return {
      average: "0.0",
      total: 0,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, pct: "0%" })),
    };
  }

  const sum = target.reduce((acc, r) => acc + r.stars, 0);
  const average = (sum / total).toFixed(1);

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  target.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.stars)));
    counts[star] = (counts[star] || 0) + 1;
  });

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars] || 0;
    const pctVal = Math.round((count / total) * 100);
    return {
      stars,
      pct: `${pctVal}%`,
    };
  });

  return {
    average,
    total,
    breakdown,
  };
}

export function isValidGoogleMapsUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim().toLowerCase();
  return (
    trimmed.includes("maps.app.goo.gl") ||
    trimmed.includes("google.com/maps") ||
    trimmed.includes("maps.google.com") ||
    trimmed.includes("goo.gl/maps") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
}

export function fetchReviewsFromGoogleMapsUrl(rawUrl: string): {
  success: boolean;
  googleMapsUrl: string;
  reviews: GoogleReview[];
  ratingSummary: ReturnType<typeof getGoogleRatingSummary>;
  message: string;
} {
  const cleanUrl = (rawUrl || "").trim();

  if (!cleanUrl) {
    return {
      success: false,
      googleMapsUrl: "",
      reviews: [],
      ratingSummary: getGoogleRatingSummary([]),
      message: "Please enter a valid Google Maps URL.",
    };
  }

  if (!isValidGoogleMapsUrl(cleanUrl)) {
    return {
      success: false,
      googleMapsUrl: "",
      reviews: [],
      ratingSummary: getGoogleRatingSummary([]),
      message: "URL format not recognized as Google Maps link.",
    };
  }

  return {
    success: true,
    googleMapsUrl: cleanUrl,
    reviews: [],
    ratingSummary: getGoogleRatingSummary([]),
    message: "Google Maps URL saved successfully!",
  };
}
