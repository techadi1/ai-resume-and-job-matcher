import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Bookmark, ArrowRight, Check, AlertCircle } from "lucide-react";
import { Card } from "./Card";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
  matchScore?: number;
  matchLabel?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  matchScore,
  matchedSkills,
  missingSkills,
  onSave,
  isSaved = false
}) => {
  const jobId = job.id || job._id;
  const reqSkills = job.requiredSkills || [];

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-white border border-slate-200">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{job.company}</p>
          </div>

          {/* Bookmark Button */}
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(jobId)}
              className={`p-1.5 rounded-md border transition-colors ${
                isSaved
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title={isSaved ? "Saved Job" : "Save Job"}
              aria-label={isSaved ? "Remove from saved" : "Save job"}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Location & Meta info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-2">
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {job.location}
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {job.jobType || job.type || "Full-time"} {job.workMode ? `· ${job.workMode}` : ""}
          </span>
          {job.salary && (
            <>
              <span>•</span>
              <span className="font-semibold text-slate-700">{job.salary}</span>
            </>
          )}
        </div>

        {/* Match Percentage Pill */}
        {matchScore !== undefined && (
          <div className="mt-3 p-2.5 rounded-md bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Estimated Match</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  matchScore >= 75
                    ? "bg-emerald-100 text-emerald-800"
                    : matchScore >= 60
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-800"
                }`}
              >
                {Math.round(matchScore)}%
              </span>
            </div>
          </div>
        )}

        {/* Matched vs Missing Skills Preview */}
        {(matchedSkills || missingSkills) && (
          <div className="mt-3 space-y-1.5 text-xs">
            {matchedSkills && matchedSkills.length > 0 && (
              <div className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-500 shrink-0">Matched:</span>
                <span className="text-slate-700 font-medium truncate">
                  {matchedSkills.slice(0, 4).join(", ")}
                  {matchedSkills.length > 4 ? ` +${matchedSkills.length - 4}` : ""}
                </span>
              </div>
            )}
            {missingSkills && missingSkills.length > 0 && (
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-slate-500 shrink-0">Missing:</span>
                <span className="text-slate-700 font-medium truncate">
                  {missingSkills.slice(0, 3).join(", ")}
                  {missingSkills.length > 3 ? ` +${missingSkills.length - 3}` : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Required Skills Tags (when no match details provided) */}
        {!matchedSkills && !missingSkills && reqSkills.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium text-slate-500 mb-1.5">Required Skills:</p>
            <div className="flex flex-wrap gap-1">
              {reqSkills.slice(0, 4).map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
              {reqSkills.length > 4 && (
                <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                  +{reqSkills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {job.experience || "1-3 years"}
        </span>
        <Link
          to={`/jobs/${jobId}`}
          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          View Job
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </Card>
  );
};
