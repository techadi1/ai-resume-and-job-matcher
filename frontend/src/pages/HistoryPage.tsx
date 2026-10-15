import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, FileText, Upload, RefreshCw, Eye } from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { resumeService } from "../services/resumeService";
import type { Resume } from "../types";
import { useToast } from "../context/ToastContext";

export const HistoryPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (err) {
      console.error("Error fetching resume history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resume and its analysis?")) {
      return;
    }

    try {
      await resumeService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => (r.id || r._id) !== id));
      success("Resume Deleted", "The resume has been removed.");
    } catch (err: any) {
      error("Delete Failed", "Could not delete resume. Please try again.");
    }
  };

  const handleReanalyze = async (id: string) => {
    try {
      await resumeService.reanalyzeResume(id);
      success("Re-analysis Queued", "Resume has been queued for background re-analysis.");
      fetchHistory();
    } catch (err) {
      error("Re-analysis Failed", "Could not re-queue resume.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resume Analysis History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track previously evaluated resume versions, scores, and date records.
          </p>
        </div>

        <Link to="/upload">
          <Button variant="primary" size="md">
            <Upload className="w-4 h-4 mr-1.5" />
            <span>Upload New Resume</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="dashboard" count={2} />
      ) : resumes.length === 0 ? (
        <EmptyState
          title="No resumes analyzed yet"
          description="Upload your latest resume to see your skills, score, and recommended jobs."
          actionText="Upload Resume"
          onAction={() => (window.location.href = "/upload")}
        />
      ) : (
        /* Real Responsive Data Table */
        <Card className="p-0 bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Skills</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Analyzed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resumes.map((r) => {
                  const rId = r.id || r._id;
                  const skillsCount = r.skills?.length || 0;
                  const formattedDate = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "—";

                  return (
                    <tr key={rId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Resume Name & File Size */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="truncate max-w-[220px]">
                            <span className="block truncate">{r.fileName}</span>
                            {r.fileSize && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                {(r.fileSize / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        {r.resumeScore !== undefined && r.resumeScore > 0 ? (
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              r.resumeScore >= 75
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : r.resumeScore >= 60
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {r.resumeScore} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Skills count */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 font-medium">
                          {skillsCount} {skillsCount === 1 ? "skill" : "skills"}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                            r.analysisStatus === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : r.analysisStatus === "FAILED"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {r.analysisStatus === "COMPLETED" ? "Completed" : r.analysisStatus}
                        </span>
                      </td>

                      {/* Analyzed Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.analysisStatus === "COMPLETED" && (
                            <Link
                              to={`/resume-analysis/${rId}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleReanalyze(rId)}
                            title="Re-run analysis"
                            className="p-1 text-slate-400 hover:text-slate-600 transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(rId)}
                            title="Delete resume"
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
