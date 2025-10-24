import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && trend !== 0 && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last period</span>
            </div>
          )}
        </div>
        <div className="text-4xl ml-4">{icon}</div>
      </div>
    </div>
  );
}