import { NextResponse } from "next/server";
import { fetchHostawayListings } from "@/lib/hostaway";

export async function GET() {
  try {
    const listings = await fetchHostawayListings();

    return NextResponse.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Failed to fetch listings:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch listings",
      },
      { status: 500 }
    );
  }
}