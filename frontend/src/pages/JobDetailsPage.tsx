import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bookmark,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Check
} from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { jobService } from "../services/jobService";
import type { Job } from "../types";
import { useToast } from "../context/ToastContext";

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const jobData = await jobService.getJob(id);
        setJob(jobData);
        setIsSaved(!!jobData.isSaved);
      } catch (err) {
        console.error("Error loading job details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      const jobId = job.id || job._id;
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        setIsSaved(false);
        success("Job Removed", "Removed from saved jobs.");
      } else {
        await jobService.saveJob(jobId);
        setIsSaved(true);
        success("Job Saved!", "Saved to your bookmarks.");
      }
    } catch (err) {
      error("Error", "Could not update saved status.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <LoadingSkeleton type="dashboard" count={2} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-lg p-8 max-w-md mx-auto">
        <h2 className="text-base font-bold text-slate-900 mb-1">Job Listing Not Found</h2>
        <p className="text-slate-500 text-xs mb-4">
          This position may have expired or been deactivated.
        </p>
        <Link to="/jobs">
          <Button variant="secondary" size="sm">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const matchScore = job.matchPercentage;
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];
  const matchedSkills = job.matchedSkills || [];
  const missingSkills = job.missingSkills || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Jobs
        </button>
      </div>

      {/* 1. Header Card */}
      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <p className="text-base font-medium text-slate-700 mt-1">{job.company}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 mt-2.5">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.location} {job.workMode ? `· ${job.workMode}` : ""}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.jobType || job.type || "Full-time"}
              </span>
              {job.salary && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-slate-900">{job.salary}</span>
                </>
              )}
            </div>
          </div>

          {/* Match Score Badge */}
          {matchScore !== undefined && matchScore !== null && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center shrink-0">
              <div className="text-2xl font-black text-slate-900">
                {Math.round(matchScore)}%
              </div>
              <span className="text-[11px] font-medium text-slate-500 uppercase">Estimated Match</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
          {job.applicationUrl ? (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="primary" size="md">
                <span>Apply on Company Site</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </a>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => success("Application Sent", "Your application was registered.")}
            >
              Apply Now
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={handleToggleSave}
            className="flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? "Saved" : "Save Job"}</span>
          </Button>
        </div>
      </Card>

      {/* 2. Match Analysis Breakdown (Why you match & Skill Gaps) */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <Card className="p-5 bg-white border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Resume Match Analysis</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Why you match */}
            <div className="p-3.5 rounded-md bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold mb-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Why You Match ({matchedSkills.length} skills)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs bg-white text-emerald-800 border border-emerald-200 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill gaps */}
            <div className="p-3.5 rounded-md bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Skill Gaps ({missingSkills.length} missing)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs bg-white text-amber-800 border border-amber-200 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
              {missingSkills.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/50">
                  <Link to="/skills" className="text-[11px] font-medium text-amber-900 hover:underline">
                    View recommended learning roadmaps for these skills →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 3. About the Role & Responsibilities */}
      <Card className="p-6 bg-white border border-slate-200 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">About the Role</h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Key Responsibilities</h3>
            <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
              {job.responsibilities.map((resp: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Skills */}
        {reqSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {reqSkills.map((sk: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {prefSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Preferred Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {prefSkills.map((sk: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-slate-50 text-slate-600 border border-slate-200"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase block mb-1">Experience Required</span>
            <p className="text-xs font-semibold text-slate-900">{job.experience || "1-3 years"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase block mb-1">Education</span>
            <p className="text-xs font-semibold text-slate-900">
              {job.education || "Bachelor's Degree in Computer Science or related field"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
