export interface HostawayReview {
  id: number;
  type: "host-to-guest" | "guest-to-host";
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  channelName?: string;
}

export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface NormalizedReview {
  id: number;
  listingId: string;
  listingName: string;
  guestName: string;
  reviewText: string;
  overallRating: number;
  categories: {
    cleanliness?: number;
    communication?: number;
    accuracy?: number;
    location?: number;
    checkIn?: number;
    value?: number;
    respectHouseRules?: number;
  };
  date: string;
  channel: string;
  type: "host-to-guest" | "guest-to-host";
  approved: boolean;
}

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
}

export interface PropertyStats {
  avgRating: number;
  totalReviews: number;
  approvedReviews: number;
  ratingDistribution: { [key: number]: number };
  channelBreakdown: { [key: string]: number };
  recentTrend: number;
}

export interface FilterOptions {
  property: string;
  channel: string;
  rating: string;
  dateRange: string;
  status: string;
}