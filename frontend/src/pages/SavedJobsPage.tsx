import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  MapPin,
  Briefcase,
  ArrowRight
} from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { jobService } from "../services/jobService";
import type { SavedJobItem } from "../types";
import { useToast } from "../context/ToastContext";

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const data = await jobService.getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error("Failed to load saved jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId: string) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => (j.id || j._id) !== jobId));
      success("Job Removed", "Removed from your saved jobs.");
    } catch (err) {
      error("Error", "Could not remove job.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Saved Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bookmarked positions you are tracking for upcoming applications.
          </p>
        </div>

        <Link to="/jobs">
          <Button variant="secondary" size="md">
            <span>Explore More Jobs</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Browse available tech listings and bookmark roles you wish to save for later."
          actionText="Browse Jobs"
          onAction={() => (window.location.href = "/jobs")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => {
            const jId = job.id || job._id;
            return (
              <Card
                key={jId}
                hoverEffect
                className="p-5 bg-white border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900 truncate">
                        <Link to={`/jobs/${jId}`} className="hover:text-blue-600 transition">
                          {job.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">{job.company}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(jId)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {job.jobType || job.type || "Full-time"}
                    </span>
                    {job.salary && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{job.salary}</span>
                      </>
                    )}
                  </div>

                  {job.matchPercentage != null && (
                    <div className="mt-3 p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Resume Match:</span>
                      <span className="font-bold text-slate-900">
                        {Math.round(Number(job.matchPercentage))}%
                      </span>
                    </div>
                  )}

                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 4).map((sk: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Saved on {job.savedAt ? new Date(job.savedAt).toLocaleDateString() : "Recently"}
                  </span>
                  <Link
                    to={`/jobs/${jId}`}
                    className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
                  >
                    View Job
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
