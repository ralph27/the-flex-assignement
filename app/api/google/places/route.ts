import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { success: false, error: "Place ID is required" },
      { status: 400 }
    );
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({
      success: false,
      error: "Google API key not configured",
      message:
        "To enable Google Reviews, add GOOGLE_PLACES_API_KEY to your .env.local file",
      documentation: {
        steps: [
          "1. Go to Google Cloud Console",
          "2. Enable Places API",
          "3. Create API credentials",
          "4. Add GOOGLE_PLACES_API_KEY to .env.local",
          "5. Get Place IDs for each property using Places Autocomplete or Search",
        ],
        estimatedCost: "$17 per 1,000 requests",
        limitations: "Maximum 5 reviews per request",
      },
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        {
          success: false,
          error: `Google Places API error: ${data.status}`,
        },
        { status: 400 }
      );
    }

    const reviews = data.result.reviews || [];

    return NextResponse.json({
      success: true,
      placeName: data.result.name,
      rating: data.result.rating,
      reviews: reviews.map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: new Date(review.time * 1000).toISOString(),
        profilePhoto: review.profile_photo_url,
      })),
    });
  } catch (error) {
    console.error("Google Places API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Google reviews",
      },
      { status: 500 }
    );
  }
}