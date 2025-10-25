import { NextRequest, NextResponse } from "next/server";
import { GooglePlacesClient } from "@/lib/google-places";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required" },
        { status: 400 }
      );
    }

    const client = new GooglePlacesClient();
    const details = await client.getPlaceDetails(placeId);

    return NextResponse.json({
      id: details.id,
      name: details.displayName?.text,
      rating: details.rating,
      userRatingCount: details.userRatingCount,
      googleMapsUri: details.googleMapsUri,
    });
  } catch (error) {
    console.error("Google place details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}