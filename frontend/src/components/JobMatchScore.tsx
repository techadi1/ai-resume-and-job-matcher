import React from "react";
import { Badge } from "./Badge";

interface JobMatchScoreProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const JobMatchScore: React.FC<JobMatchScoreProps> = ({ score, label, size = "md" }) => {
  const roundedScore = Math.round(score);

  let variant: "success" | "info" | "purple" | "warning" | "error" = "info";
  let defaultLabel = "Good Match";

  if (roundedScore >= 85) {
    variant = "success";
    defaultLabel = "Excellent Match";
  } else if (roundedScore >= 70) {
    variant = "info";
    defaultLabel = "Strong Match";
  } else if (roundedScore >= 55) {
    variant = "purple";
    defaultLabel = "Good Match";
  } else if (roundedScore >= 40) {
    variant = "warning";
    defaultLabel = "Partial Match";
  } else {
    variant = "error";
    defaultLabel = "Low Match";
  }

  const textLabel = label || defaultLabel;

  if (size === "sm") {
    return (
      <Badge variant={variant} size="sm">
        {roundedScore}% • {textLabel}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-extrabold tracking-tight text-white">{roundedScore}%</span>
      <Badge variant={variant} size="md">
        {textLabel}
      </Badge>
    </div>
  );
};
