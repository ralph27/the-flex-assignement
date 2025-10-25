import { NextRequest, NextResponse } from "next/server";
import { GooglePlacesClient } from "@/lib/google-places";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const client = new GooglePlacesClient();
    const places = await client.searchText(query);

    return NextResponse.json({
      places: places.map((p) => ({
        id: p.id,
        name: p.displayName?.text,
        rating: p.rating,
        totalRatings: p.userRatingCount,
        url: p.googleMapsUri,
      })),
    });
  } catch (error) {
    console.error("Google search error:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}