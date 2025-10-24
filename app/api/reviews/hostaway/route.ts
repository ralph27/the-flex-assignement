import { NextRequest, NextResponse } from "next/server";
import { fetchHostawayReviews } from "@/lib/hostaway";
import { MOCK_REVIEWS } from "@/lib/mock-data";
import { normalizeReview } from "@/lib/utils";
import {
  loadReviewsState,
  saveReviewsState,
} from "@/lib/storage";
import { HostawayReview } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    let reviews: HostawayReview[] = [];
    let source = "hostaway";
    let error = null;

    try {
      console.log("Attempting to fetch from Hostaway API...");
      reviews = await fetchHostawayReviews();
      console.log(`Successfully fetched ${reviews.length} reviews from Hostaway`);
    } catch (apiError) {
      console.error("Hostaway API failed, using mock data:", apiError);
      source = "mock";
      error = apiError instanceof Error ? apiError.message : "API Error";
      reviews = MOCK_REVIEWS;
    }

    if (reviews.length === 0) {
      console.log("No reviews from API, using mock data");
      source = "mock";
      reviews = MOCK_REVIEWS;
    }

    const existingState = await loadReviewsState();
    const approvedIds = new Set(
      existingState?.reviews.filter((r) => r.approved).map((r) => r.id) || []
    );

    const normalizedReviews = reviews.map((review) => {
      const normalized = normalizeReview(review);
      if (approvedIds.has(normalized.id)) {
        normalized.approved = true;
      }
      return normalized;
    });

    const newState = {
      reviews: normalizedReviews,
      lastUpdated: new Date().toISOString(),
    };
    await saveReviewsState(newState);

    return NextResponse.json({
      success: true,
      count: normalizedReviews.length,
      data: normalizedReviews,
      lastUpdated: newState.lastUpdated,
      source,
      ...(error && { error }),
    });
  } catch (error) {
    console.error("Unexpected error in reviews endpoint:", error);

    const normalizedReviews = MOCK_REVIEWS.map(normalizeReview);

    return NextResponse.json(
      {
        success: true,
        count: normalizedReviews.length,
        data: normalizedReviews,
        source: "mock-fallback",
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Using mock data due to unexpected error",
      },
      { status: 200 }
    );
  }
}