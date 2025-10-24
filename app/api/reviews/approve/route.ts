import { NextRequest, NextResponse } from "next/server";
import { loadReviewsState, saveReviewsState } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { reviewId, approved } = await request.json();

    if (typeof reviewId !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      );
    }

    const state = await loadReviewsState();
    if (!state) {
      return NextResponse.json(
        { success: false, error: "No reviews data found" },
        { status: 404 }
      );
    }

    const review = state.reviews.find((r) => r.id === reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    review.approved = approved !== undefined ? approved : !review.approved;
    await saveReviewsState(state);

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error updating review approval:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update review",
      },
      { status: 500 }
    );
  }
}