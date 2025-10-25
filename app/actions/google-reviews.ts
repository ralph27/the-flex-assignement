"use server";

import { revalidatePath } from "next/cache";
import {
  GooglePlacesClient,
  normalizeGoogleReview,
} from "@/lib/google-places";
import { NormalizedReview } from "@/lib/types";

export async function syncGoogleReviews(
  placeId: string,
  listingId: string,
  listingName: string
): Promise<{ success: boolean; reviews?: NormalizedReview[]; error?: string }> {
  try {
    const client = new GooglePlacesClient();
    const googleReviews = await client.getReviews(placeId);

    const normalized = googleReviews.map((review) =>
      normalizeGoogleReview(review, listingId, listingName)
    );


    revalidatePath("/dashboard");
    revalidatePath("/reviews");

    return { success: true, reviews: normalized };
  } catch (error) {
    console.error("Sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

export async function searchGooglePlaces(query: string) {
  try {
    const client = new GooglePlacesClient();
    const places = await client.searchText(query);
    return { success: true, places };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}