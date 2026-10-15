import React from "react";

interface LoadingSkeletonProps {
  type?: "card" | "list" | "table" | "dashboard";
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = "card", count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-5 bg-slate-200 rounded w-14" />
              <div className="h-5 bg-slate-200 rounded w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse flex justify-between items-center">
          <div className="space-y-2 w-2/3">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
          <div className="h-8 bg-slate-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
};
