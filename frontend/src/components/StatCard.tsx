import React from "react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: "blue" | "purple" | "emerald" | "amber";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = "blue"
}) => {
  const accentStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100"
  };

  return (
    <Card hoverEffect className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-2 flex items-center ${trend.isPositive ? "text-emerald-700" : "text-rose-700"}`}>
              <span>{trend.isPositive ? "↑" : "↓"} {trend.value}</span>
              <span className="text-slate-400 ml-1">vs last check</span>
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border ${accentStyles[accentColor]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
