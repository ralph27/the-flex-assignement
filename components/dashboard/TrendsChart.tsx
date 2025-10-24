"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { NormalizedReview } from "@/lib/types";
import { format, subDays, startOfDay } from "date-fns";

interface TrendsChartProps {
  reviews: NormalizedReview[];
}

function startOfUtcDay(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}
function toUtcDayKey(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function TrendsChart({ reviews }: TrendsChartProps) {
  const parsedTimes = reviews
    .map((r) => new Date(r.date))
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => startOfUtcDay(d).getTime());

  const anchorDate =
    parsedTimes.length > 0 ? new Date(Math.max(...parsedTimes)) : new Date();

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = startOfUtcDay(
      new Date(anchorDate.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
    );
    return {
      key: toUtcDayKey(date),
      label: format(date, "MMM dd"),
      date,
    };
  });

  const dayBuckets = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const d = new Date(review.date);
    if (isNaN(d.getTime())) continue;

    const day = startOfUtcDay(d);
    const key = toUtcDayKey(day);
    const rating = Number(review.overallRating);
    if (!Number.isFinite(rating)) continue;

    const b = dayBuckets.get(key) ?? { sum: 0, count: 0 };
    b.sum += rating;
    b.count += 1;
    dayBuckets.set(key, b);
  }

  const perDay = days.map(({ key, label, date }) => {
    const b = dayBuckets.get(key);
    const avg = b && b.count > 0 ? b.sum / b.count : 0;
    return {
      key,
      date: label,
      fullDate: date,
      avgRating: Number(avg.toFixed(2)),
      count: b?.count ?? 0,
    };
  });

const windowSize = 7;

const withRolling = perDay.map((_, i, arr) => {
  const start = Math.max(0, i - windowSize + 1);
  const slice = arr.slice(start, i + 1).filter((d) => d.count > 0);
  const totCount = slice.reduce((acc, d) => acc + d.count, 0);
  const totSum = slice.reduce((acc, d) => acc + d.avgRating * d.count, 0);
  const rolling =
    totCount > 0 ? Number((totSum / totCount).toFixed(2)) : null;
  return { ...arr[i], rollingAvg: rolling };
});

  const channelData = reviews.reduce((acc: any[], review) => {
    const existing = acc.find((item) => item.channel === review.channel);
    if (existing) {
      existing.count += 1;
      existing.avgRating =
        (existing.avgRating * (existing.count - 1) + review.overallRating) /
        existing.count;
    } else {
      acc.push({
        channel: review.channel,
        count: 1,
        avgRating: review.overallRating,
      });
    }
    return acc;
  }, []);

  

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rating Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={withRolling}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgRating"
              stroke="#93c5fd"
              strokeWidth={2}
              name="Daily Avg"
            />
            <Line
              type="monotone"
              dataKey="rollingAvg"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="7-day Rolling Avg"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reviews by Channel
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={channelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Number of Reviews" />
            <Bar dataKey="avgRating" fill="#10b981" name="Average Rating" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}