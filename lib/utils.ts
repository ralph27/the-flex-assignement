import { NormalizedReview, PropertyStats, HostawayReview } from "./types";
import { format, subDays, isAfter } from "date-fns";

export function normalizeReview(review: HostawayReview): NormalizedReview {
  const categoryRatings = review.reviewCategory || [];
  const avgRating =
    categoryRatings.length > 0
      ? categoryRatings.reduce((sum, cat) => sum + cat.rating, 0) /
        categoryRatings.length
      : review.rating || 0;

  const categories: any = {};
  categoryRatings.forEach((cat) => {
    const key = cat.category
      .replace(/_/g, "")
      .replace("respecthouserules", "respectHouseRules")
      .replace("checkin", "checkIn");
    categories[key] = cat.rating;
  });

  return {
    id: review.id,
    listingId: extractListingId(review.listingName),
    listingName: review.listingName,
    guestName: review.guestName,
    reviewText: review.publicReview,
    overallRating: Math.round(avgRating * 10) / 10,
    categories,
    date: review.submittedAt,
    channel: review.channelName || "Direct",
    type: review.type,
    approved: false,
  };
}

export function extractListingId(listingName: string): string {
  return listingName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calculateStats(reviews: NormalizedReview[]): PropertyStats {
  if (reviews.length === 0) {
    return {
      avgRating: 0,
      totalReviews: 0,
      approvedReviews: 0,
      ratingDistribution: {},
      channelBreakdown: {},
      recentTrend: 0,
    };
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

  const ratingDistribution: { [key: number]: number } = {};
  reviews.forEach((review) => {
    const rounded = Math.round(review.overallRating);
    ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
  });

  const channelBreakdown: { [key: string]: number } = {};
  reviews.forEach((review) => {
    channelBreakdown[review.channel] =
      (channelBreakdown[review.channel] || 0) + 1;
  });

  const thirtyDaysAgo = subDays(new Date(), 30);
  const sixtyDaysAgo = subDays(new Date(), 60);

  const recentReviews = reviews.filter((r) =>
    isAfter(new Date(r.date), thirtyDaysAgo)
  );
  const previousReviews = reviews.filter(
    (r) =>
      isAfter(new Date(r.date), sixtyDaysAgo) &&
      !isAfter(new Date(r.date), thirtyDaysAgo)
  );

  const recentAvg =
    recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.overallRating, 0) /
        recentReviews.length
      : 0;
  const previousAvg =
    previousReviews.length > 0
      ? previousReviews.reduce((sum, r) => sum + r.overallRating, 0) /
        previousReviews.length
      : 0;

  const recentTrend =
    previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return {
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
    approvedReviews: reviews.filter((r) => r.approved).length,
    ratingDistribution,
    channelBreakdown,
    recentTrend: Math.round(recentTrend * 10) / 10,
  };
}

export function getUniqueProperties(
  reviews: NormalizedReview[]
): Array<{ id: string; name: string }> {
  const uniqueMap = new Map();
  reviews.forEach((review) => {
    if (!uniqueMap.has(review.listingId)) {
      uniqueMap.set(review.listingId, {
        id: review.listingId,
        name: review.listingName,
      });
    }
  });
  return Array.from(uniqueMap.values());
}

export function getUniqueChannels(reviews: NormalizedReview[]): string[] {
  return Array.from(new Set(reviews.map((r) => r.channel)));
}

export function formatDate(date: string): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function getStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return "⭐".repeat(fullStars) + (hasHalfStar ? "½" : "");
}