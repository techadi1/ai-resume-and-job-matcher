import React from "react";

interface CircularProgressProps {
  score?: number;
  value?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  isPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  value,
  size = 130,
  strokeWidth = 9,
  color,
  label,
  sublabel,
  isPercentage = false
}) => {
  const actualScore = value !== undefined ? value : score !== undefined ? score : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(actualScore, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = "#2563eb"; // Royal Blue
  if (color === "emerald") colorClass = "#059669";
  else if (color === "blue") colorClass = "#2563eb";
  else if (color === "amber") colorClass = "#d97706";
  else if (color === "rose") colorClass = "#e11d48";
  else if (normalizedScore >= 80) colorClass = "#059669";
  else if (normalizedScore >= 65) colorClass = "#2563eb";
  else if (normalizedScore >= 50) colorClass = "#d97706";
  else colorClass = "#e11d48";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Inner Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {Math.round(actualScore)}
          {isPercentage ? (
            <span className="text-xs font-normal text-slate-500">%</span>
          ) : (
            <span className="text-xs font-normal text-slate-500">/100</span>
          )}
        </span>
        {label && <span className="text-xs font-medium text-slate-600 mt-0.5">{label}</span>}
        {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
      </div>
    </div>
  );
};
