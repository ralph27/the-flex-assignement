"use client";

import { useState } from "react";
import { searchGooglePlaces, syncGoogleReviews } from "@/app/actions/google-reviews";

interface GooglePlaceConfigProps {
  listingId: string;
  listingName: string;
  currentPlaceId?: string;
}

export function GooglePlaceConfig({
  listingId,
  listingName,
  currentPlaceId,
}: GooglePlaceConfigProps) {
  const [query, setQuery] = useState(listingName);
  const [results, setResults] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(currentPlaceId);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/google/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.places || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedPlaceId) return;
    setSyncing(true);
    try {
      const result = await syncGoogleReviews(
        selectedPlaceId,
        listingId,
        listingName
      );
      if (result.success) {
        alert(
          `Synced ${result.reviews?.length || 0} reviews from Google`
        );
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold">
        Configure Google Reviews for {listingName}
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for place..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Select a place:</p>
          {results.map((place) => (
            <label
              key={place.id}
              className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="place"
                value={place.id}
                checked={selectedPlaceId === place.id}
                onChange={() => setSelectedPlaceId(place.id)}
              />
              <div className="flex-1">
                <div className="font-medium">{place.name}</div>
                <div className="text-sm text-gray-600">
                  {place.rating ? `★ ${place.rating}` : "No rating"} ·{" "}
                  {place.totalRatings || 0} reviews
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {selectedPlaceId && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync Reviews Now"}
          </button>
          <span className="text-sm text-gray-600">
            Place ID: {selectedPlaceId}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>
          ⚠️ Google reviews shown are limited (typically ~5 most recent).
          Full historical data not available via API.
        </p>
        <p className="mt-1">
          Attribution: Reviews must display "Powered by Google" when shown.
        </p>
      </div>
    </div>
  );
}