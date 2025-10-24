import React from "react";
import { FilterOptions, NormalizedReview } from "@/lib/types";
import { getUniqueProperties, getUniqueChannels } from "@/lib/utils";

interface FiltersPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  reviews: NormalizedReview[];
}

export function FiltersPanel({
  filters,
  onFiltersChange,
  reviews,
}: FiltersPanelProps) {
  const properties = getUniqueProperties(reviews);
  const channels = getUniqueChannels(reviews);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={() =>
            onFiltersChange({
              property: "all",
              channel: "all",
              rating: "all",
              dateRange: "all",
              status: "all",
            })
          }
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property
          </label>
          <select
            value={filters.property}
            onChange={(e) => updateFilter("property", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Properties</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channel
          </label>
          <select
            value={filters.channel}
            onChange={(e) => updateFilter("channel", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Channels</option>
            {channels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => updateFilter("rating", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="9">9+ Stars</option>
            <option value="8">8+ Stars</option>
            <option value="7">7+ Stars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter("dateRange", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>
    </div>
  );
}