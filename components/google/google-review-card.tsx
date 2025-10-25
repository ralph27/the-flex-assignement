"use client";

import { NormalizedReview } from "@/lib/types";
import { format } from "date-fns";

export function GoogleReviewCard({ review }: { review: NormalizedReview }) {
  return (
    <div className="p-4 border rounded-lg bg-white space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{review.guestName}</p>
          <p className="text-sm text-gray-600">
            {format(new Date(review.date), "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-semibold">{review.overallRating}</span>
        </div>
      </div>

      <p className="text-gray-700">{review.reviewText}</p>

      {review.channel === "Google" && (
        <div className="flex items-center gap-2 pt-2 border-t text-xs text-gray-500">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/googleg_16dp.png"
            alt="Google"
            className="w-4 h-4"
          />
          <span>Powered by Google</span>
        </div>
      )}
    </div>
  );
}