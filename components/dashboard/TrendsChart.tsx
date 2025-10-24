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
    const times = reviews
    .map((r) => new Date(r.date))
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => startOfUtcDay(d).getTime());

    const nowUTC = startOfUtcDay(new Date());
    const maxSpanDays = 90; // cap the window size
    let startDate: Date;
    let endDate: Date;

    if (times.length > 0) {
        const minT = Math.min(...times);
        const maxT = Math.max(...times);
        endDate = new Date(maxT);
        const spanDays = Math.min(
            maxSpanDays,
            Math.max(30, Math.ceil((maxT - minT) / (24 * 3600 * 1000)) + 1)
        );
        startDate = startOfUtcDay(
            new Date(endDate.getTime() - (spanDays - 1) * 24 * 3600 * 1000)
        );
    } else {
        endDate = nowUTC;
        startDate = startOfUtcDay(new Date(endDate.getTime() - 29 * 24 * 3600 * 1000));
    }

    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000)) + 1;

    const days = Array.from({ length: totalDays }, (_, i) => {
        const date = startOfUtcDay(new Date(startDate.getTime() + i * 24 * 3600 * 1000));
        return { key: toUtcDayKey(date), label: format(date, "MMM dd"), date };
    });


	const dayBuckets = new Map<string, { sum: number; count: number }>();

	for (const review of reviews) {
	  const d = new Date(review.date);
	  if (isNaN(d.getTime())) continue;
	  const key = toUtcDayKey(startOfUtcDay(d));
	  const rating = Number(review.overallRating);
	  if (!Number.isFinite(rating)) continue;
	  const b = dayBuckets.get(key) ?? { sum: 0, count: 0 };
	  b.sum += rating;
	  b.count += 1;
	  dayBuckets.set(key, b);
	}
	
	const perDay = days.map(({ key, label, date }) => {
	  const b = dayBuckets.get(key);
	  const avg = b && b.count > 0 ? b.sum / b.count : null; 
	  return {
	    key,
	    date: label,
	    fullDate: date,
	    avgRating: avg === null ? null : Number(avg.toFixed(2)),
	    count: b?.count ?? 0,
	  };
	});
	
	const windowSize = 7;
    const gapThresholdDays = 3;

	let lastNonEmptyIndex: number | null = null;
	
	const withRolling = perDay.map((_, i, arr) => {
	  const start = Math.max(0, i - windowSize + 1);
	  const slice = arr.slice(start, i + 1).filter((d) => d.count > 0);
	  const totCount = slice.reduce((acc, d) => acc + d.count, 0);
	  const totSum = slice.reduce(
	    (acc, d) => acc + (d.avgRating ?? 0) * d.count,
	    0
	  );
	  let rolling = totCount > 0 ? Number((totSum / totCount).toFixed(2)) : null;
	
	  // gap breaking
	  if (arr[i].count > 0) {
	    if (
	      lastNonEmptyIndex !== null &&
	      i - lastNonEmptyIndex > gapThresholdDays
	    ) {
	      // break the line by nulling this point once (it will reconnect naturally)
	      rolling = null;
	    }
	    lastNonEmptyIndex = i;
	  }
	
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
                    connectNulls={false}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="rollingAvg"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="7-day Rolling Avg"
                    connectNulls={true}
                    dot={false}
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