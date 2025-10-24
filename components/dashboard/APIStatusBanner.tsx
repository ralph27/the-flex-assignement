"use client";

import React from "react";
import { AlertCircle, CheckCircle, Database } from "lucide-react";

interface APIStatusBannerProps {
  source: string;
  error?: string;
  lastUpdated: string;
}

export function APIStatusBanner({
  source,
  error,
  lastUpdated,
}: APIStatusBannerProps) {
  const isLive = source === "hostaway";
  const isMock = source === "mock" || source === "mock-fallback";

  return (
    <div
      className={`rounded-lg p-4 mb-6 border ${
        isLive
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isLive ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-sm font-medium ${
              isLive ? "text-green-800" : "text-yellow-800"
            }`}
          >
            {isLive
              ? "✓ Connected to Hostaway API"
              : "⚠ Using Mock Data"}
          </h3>
          <div
            className={`mt-2 text-sm ${
              isLive ? "text-green-700" : "text-yellow-700"
            }`}
          >
            {isLive ? (
              <p>
                Successfully fetching live reviews from Hostaway.{" "}
                <span className="font-medium">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              </p>
            ) : (
              <div>
                <p className="font-medium mb-1">
                  Unable to connect to Hostaway API. Displaying mock data.
                </p>
                {error && (
                  <p className="text-xs mt-1">
                    <span className="font-semibold">Error:</span> {error}
                  </p>
                )}
                <p className="text-xs mt-2">
                  This is expected in the sandbox environment. The mock data
                  demonstrates full functionality.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="ml-3">
          <Database
            className={isLive ? "text-green-600" : "text-yellow-600"}
            size={20}
          />
        </div>
      </div>
    </div>
  );
}