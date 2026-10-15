import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Upload, Sparkles, RefreshCw, AlertCircle, ArrowRight, Clock } from "lucide-react";

import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { FileUploader } from "../components/FileUploader";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { resumeService, type UploadResponse } from "../services/resumeService";
import type { Resume } from "../types";
import { useToast } from "../context/ToastContext";

export const ResumeAnalyzerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "recent">("upload");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Load existing user resumes on mount
  useEffect(() => {
    const fetchRecentResumes = async () => {
      try {
        const resumes = await resumeService.getResumes();
        if (resumes && resumes.length > 0) {
          setRecentResumes(resumes);
        }
      } catch (err) {
        console.error("Failed to load user resume history:", err);
      }
    };
    fetchRecentResumes();
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setUploadResult(null);
    try {
      const res = await resumeService.uploadResume(file);
      setUploadResult(res);
      success("Resume Uploaded!", `'${file.name}' is now being analyzed. This may take a moment.`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || "Failed to process resume file. Please verify format.";
      error("Upload Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="AI Resume Analyzer"
        description="Upload your resume to calculate your AI-estimated ATS compatibility score, detect technical skills, and uncover missing sections."
        badge={<Badge variant="info">PyMuPDF + spaCy Engine</Badge>}
        action={
          uploadResult && (
            <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Analyze New Resume
            </Button>
          )
        }
      />

      {/* Input Section */}
      {!uploadResult && (
        <Card className="p-6">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-800">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "upload"
                  ? "bg-electric-500 text-white shadow-glow"
                  : "bg-navy-950 text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Resume File
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "recent"
                  ? "bg-electric-500 text-white shadow-glow"
                  : "bg-navy-950 text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent Resumes
              {recentResumes.length > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] rounded-full px-1.5 py-0.5 ml-1">
                  {recentResumes.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "upload" ? (
            <FileUploader onFileSelect={handleFileUpload} isLoading={isLoading} />
          ) : (
            <div className="space-y-3">
              {recentResumes.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No recent resumes found.</p>
                  <p className="text-xs text-slate-500 mt-1">Upload your first resume to get started.</p>
                </div>
              ) : (
                recentResumes.map((r) => {
                  const rId = r.id || r._id;
                  return (
                    <div
                      key={rId}
                      className="flex items-center justify-between p-4 bg-navy-950 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{r.fileName}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()} • Score: {r.resumeScore}/100
                          </p>
                        </div>
                      </div>
                      <Link to={`/resume-analysis/${rId}`}>
                        <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                          View Analysis
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </Card>
      )}

      {/* Loading Skeleton during Analysis */}
      {isLoading && <LoadingSkeleton type="card" count={3} />}

      {/* Upload Success — Redirect to analysis page */}
      {uploadResult && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Upload Confirmation */}
          <Card className="p-6 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{uploadResult.fileName}</h3>
                  <Badge variant="success">Uploaded</Badge>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Your resume has been uploaded and queued for AI analysis. Click below to view the full report once processing is complete.
                </p>

                {uploadResult.analysisStatus === "PROCESSING" || uploadResult.analysisStatus === "UPLOADED" ? (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-300">
                      Analysis is in progress. The results page will show a live status until processing completes.
                    </p>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => navigate(`/resume-analysis/${uploadResult.resumeId}`)}
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    View Analysis Report
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Upload Another
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
