"use client";

import React from "react";
import { NormalizedReview } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ReviewsSectionProps {
  reviews: NormalizedReview[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const approvedReviews = reviews.filter((r) => r.approved);

  if (approvedReviews.length === 0) {
    return null;
  }

  const avgRating =
    approvedReviews.reduce((sum, r) => sum + r.overallRating, 0) /
    approvedReviews.length;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Guest Reviews</h2>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-4xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </span>
              <span className="ml-2 text-3xl text-yellow-400">⭐</span>
            </div>
            <div className="ml-6 text-gray-600">
              <p className="text-lg font-medium">
                {approvedReviews.length} review
                {approvedReviews.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm">Verified guests</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {review.guestName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.date)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-900">
                    {review.overallRating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-yellow-400">⭐</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                {review.reviewText}
              </p>

              {Object.keys(review.categories).length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(review.categories)
                      .slice(0, 3)
                      .map(([category, rating]) => (
                        <div
                          key={category}
                          className="flex items-center px-3 py-1 bg-gray-50 rounded-full text-sm"
                        >
                          <span className="font-medium text-gray-700 capitalize">
                            {category.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {rating}/10
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center text-xs text-gray-500">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {review.channel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}