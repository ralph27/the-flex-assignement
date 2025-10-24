"use client";

import React, { useEffect, useState } from "react";
import { NormalizedReview, FilterOptions } from "@/lib/types";
import { calculateStats } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { ReviewsTable } from "@/components/dashboard/ReviewsTable";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { APIStatusBanner } from "@/components/dashboard/APIStatusBanner";
import { RefreshCw } from "lucide-react";
import { subDays, isAfter } from "date-fns";

export default function DashboardPage() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    source: "unknown",
    error: "",
    lastUpdated: "",
  });
  const [filters, setFilters] = useState<FilterOptions>({
    property: "all",
    channel: "all",
    rating: "all",
    dateRange: "all",
    status: "all",
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch("/api/reviews/hostaway");
      const data = await res.json();
      
      setReviews(data.data || []);
      setApiStatus({
        source: data.source,
        error: data.error || "",
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setApiStatus({
        source: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleApproval = async (reviewId: number) => {
    try {
      await fetch("/api/reviews/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      await fetchReviews();
    } catch (error) {
      console.error("Failed to toggle approval:", error);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filters.property !== "all" && review.listingId !== filters.property)
      return false;
    if (filters.channel !== "all" && review.channel !== filters.channel)
      return false;
    if (filters.rating !== "all") {
      const minRating = parseInt(filters.rating);
      if (review.overallRating < minRating) return false;
    }
    if (filters.dateRange !== "all") {
      const days = parseInt(filters.dateRange);
      const cutoff = subDays(new Date(), days);
      if (!isAfter(new Date(review.date), cutoff)) return false;
    }
    if (filters.status === "approved" && !review.approved) return false;
    if (filters.status === "pending" && review.approved) return false;
    return true;
  });

  const stats = calculateStats(reviews);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Hostaway API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reviews Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor guest reviews across all properties
              </p>
            </div>
            <button
              onClick={() => fetchReviews(true)}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                size={18}
                className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* API Status Banner */}
        <APIStatusBanner
          source={apiStatus.source}
          error={apiStatus.error}
          lastUpdated={apiStatus.lastUpdated}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Average Rating"
            value={stats.avgRating.toFixed(1)}
            icon="⭐"
            trend={stats.recentTrend}
            subtitle={`Out of 10.0`}
          />
          <StatsCard
            title="Total Reviews"
            value={stats.totalReviews}
            icon="📝"
            subtitle={`${filteredReviews.length} shown`}
          />
          <StatsCard
            title="Approved"
            value={stats.approvedReviews}
            icon="✅"
            subtitle={`${((stats.approvedReviews / stats.totalReviews) * 100 || 0).toFixed(0)}% of total`}
          />
          <StatsCard
            title="Pending"
            value={stats.totalReviews - stats.approvedReviews}
            icon="⏳"
            subtitle="Awaiting approval"
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            reviews={reviews}
          />
        </div>

        {/* Charts */}
        <div className="mb-6">
          <TrendsChart reviews={filteredReviews} />
        </div>

        {/* Reviews Table */}
        <ReviewsTable
          reviews={filteredReviews}
          onApprovalToggle={toggleApproval}
        />
      </div>
    </div>
  );
}