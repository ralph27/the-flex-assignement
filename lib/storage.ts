import { NormalizedReview } from "./types";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "reviews-state.json");

export interface ReviewsState {
  reviews: NormalizedReview[];
  lastUpdated: string;
}

export async function loadReviewsState(): Promise<ReviewsState | null> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function saveReviewsState(state: ReviewsState): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error("Error saving reviews state:", error);
  }
}

export async function updateReviewApproval(
  reviewId: number,
  approved: boolean
): Promise<void> {
  const state = await loadReviewsState();
  if (!state) return;

  const review = state.reviews.find((r) => r.id === reviewId);
  if (review) {
    review.approved = approved;
    await saveReviewsState(state);
  }
}