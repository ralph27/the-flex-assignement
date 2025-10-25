import { NextRequest, NextResponse } from "next/server";
import {
  GooglePlacesClient,
  normalizeGoogleReview,
} from "@/lib/google-places";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get("placeId");
    const listingId = searchParams.get("listingId");
    const listingName = searchParams.get("listingName");

    if (!placeId || !listingId || !listingName) {
      return NextResponse.json(
        { error: "placeId, listingId, and listingName are required" },
        { status: 400 }
      );
    }

    const client = new GooglePlacesClient();
    const details = await client.getPlaceDetails(placeId);
    const reviews = details.reviews || [];

    const normalized = reviews.map((review) =>
      normalizeGoogleReview(review, listingId, listingName)
    );

    return NextResponse.json({
      place: {
        id: details.id,
        name: details.displayName?.text,
        rating: details.rating,
        userRatingCount: details.userRatingCount,
        googleMapsUri: details.googleMapsUri,
      },
      reviews: normalized,
      rawReviews: reviews,
      attributionRequired: true,
    });
  } catch (error) {
    console.error("Google reviews error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}