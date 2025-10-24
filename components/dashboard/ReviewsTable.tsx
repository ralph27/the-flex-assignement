"use client";

import React, { useState } from "react";
import { NormalizedReview } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Eye, Check, X } from "lucide-react";

interface ReviewsTableProps {
  reviews: NormalizedReview[];
  onApprovalToggle: (reviewId: number) => void;
}

export function ReviewsTable({
  reviews,
  onApprovalToggle,
}: ReviewsTableProps) {
  const [selectedReview, setSelectedReview] = useState<NormalizedReview | null>(
    null
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest & Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="font-medium text-gray-900">
                        {review.guestName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {review.reviewText}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {review.listingName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {review.overallRating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-yellow-400">⭐</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.keys(review.categories).length} categories
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(review.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {review.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onApprovalToggle(review.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          review.approved
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {review.approved ? (
                          <span className="flex items-center">
                            <Check size={14} className="mr-1" /> Approved
                          </span>
                        ) : (
                          "Approve"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprovalToggle={onApprovalToggle}
        />
      )}
    </>
  );
}

function ReviewDetailModal({
  review,
  onClose,
  onApprovalToggle,
}: {
  review: NormalizedReview;
  onClose: () => void;
  onApprovalToggle: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {review.guestName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(review.date)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {review.overallRating.toFixed(1)}
              </span>
              <span className="ml-2 text-2xl text-yellow-400">⭐</span>
            </div>
            <p className="text-sm text-gray-600">{review.listingName}</p>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mt-2">
              {review.channel}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Review
            </h3>
            <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Category Ratings
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(review.categories).map(([category, rating]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="font-bold text-gray-900">{rating}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Status:{" "}
              {review.approved ? (
                <span className="font-medium text-green-600">
                  ✓ Approved for public display
                </span>
              ) : (
                <span className="font-medium text-gray-500">
                  Pending approval
                </span>
              )}
            </div>
            <button
              onClick={() => {
                onApprovalToggle(review.id);
                onClose();
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                review.approved
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {review.approved ? "Remove Approval" : "Approve Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}