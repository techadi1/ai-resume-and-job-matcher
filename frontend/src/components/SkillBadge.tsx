import React from "react";
import { X } from "lucide-react";

interface SkillBadgeProps {
  name: string;
  category?: string;
  isMatched?: boolean;
  isMissing?: boolean;
  onRemove?: () => void;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  isMatched,
  isMissing,
  onRemove
}) => {
  let colorStyle = "bg-slate-100 text-slate-800 border-slate-200/90";

  if (isMatched) {
    colorStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (isMissing) {
    colorStyle = "bg-rose-50 text-rose-800 border-rose-200";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorStyle}`}>
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 text-slate-400 hover:text-slate-600 transition"
          aria-label={`Remove ${name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
