import { GooglePlaceDetails, GooglePlaceReview, NormalizedReview } from "./types";

interface SearchTextRequest {
  textQuery: string;
  languageCode?: string;
  maxResultCount?: number;
}

interface PlaceDetailsRequest {
  placeId: string;
  fields?: string[];
}

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = "https://places.googleapis.com/v1";

export class GooglePlacesClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    if (!apiKey && !GOOGLE_API_KEY) {
      throw new Error("Google Places API key not configured");
    }
    this.apiKey = apiKey || GOOGLE_API_KEY!;
  }

  async searchText(query: string): Promise<GooglePlaceDetails[]> {
    const response = await fetch(`${BASE_URL}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 5,
      } as SearchTextRequest),
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API error: ${error}`);
    }

    const data = await response.json();
    return data.places || [];
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
    const fields = [
      "id",
      "displayName",
      "rating",
      "userRatingCount",
      "googleMapsUri",
      "reviews",
    ].join(",");

    const response = await fetch(
      `${BASE_URL}/${encodeURIComponent(placeId)}?fields=${fields}`,
      {
        headers: {
          "X-Goog-Api-Key": this.apiKey,
        },
        next: { revalidate: 21600 },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API error: ${error}`);
    }

    return response.json();
  }

  async getReviews(placeId: string): Promise<GooglePlaceReview[]> {
    const details = await this.getPlaceDetails(placeId);
    return details.reviews || [];
  }
}

export function normalizeGoogleReview(
  review: GooglePlaceReview,
  listingId: string,
  listingName: string
): NormalizedReview {
  return {
    id: parseInt(
      review.name.split("/").pop()?.replace(/\D/g, "") || String(Date.now())
    ),
    listingId,
    listingName,
    guestName: review.authorAttribution.displayName,
    reviewText: review.text?.text || review.originalText?.text || "",
    overallRating: review.rating,
    categories: {},
    date: review.publishTime,
    channel: "Google",
    type: "guest-to-host" as const,
    approved: true,
  };
}