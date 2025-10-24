"use client";

import React, { useEffect, useState } from "react";
import { NormalizedReview } from "@/lib/types";
import { ReviewsSection } from "@/app/property/ReviewsSection";
import { useParams } from "next/navigation";

export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyReviews();
  }, [propertyId]);

  const fetchPropertyReviews = async () => {
    try {
      const res = await fetch("/api/reviews/hostaway");
      const data = await res.json();
      const propertyReviews = (data.data || []).filter(
        (r: NormalizedReview) => r.listingId === propertyId
      );
      setReviews(propertyReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  const propertyName =
    reviews.length > 0 ? reviews[0].listingName : "Property";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mimicking Flex Living style */}
      <div className="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{propertyName}</h1>
            <p className="text-xl">Flexible Living in the Heart of London</p>
          </div>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              About this Property
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Experience luxury living in one of London's most vibrant
              neighborhoods. This beautifully furnished apartment offers all the
              comforts of home with the flexibility you need.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Perfect for professionals, families, or anyone looking for a
              premium short-term or extended stay in London.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Amenities
            </h3>
            <ul className="grid grid-cols-2 gap-3">
              {[
                "High-Speed WiFi",
                "Fully Equipped Kitchen",
                "Smart TV",
                "Air Conditioning",
                "Washer & Dryer",
                "24/7 Support",
                "Self Check-in",
                "Prime Location",
              ].map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center text-gray-700"
                >
                  <span className="mr-2 text-green-500">✓</span>
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection reviews={reviews} />

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-xl mb-8">
            Experience flexible living at its finest
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}