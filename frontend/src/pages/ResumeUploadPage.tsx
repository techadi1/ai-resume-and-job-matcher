import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useToast } from "../context/ToastContext";
import { resumeService } from "../services/resumeService";
import type { Resume } from "../types";

export const ResumeUploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED">("IDLE");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeScore, setResumeScore] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stepStage, setStepStage] = useState<number>(0);
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const stages = [
    { label: "Uploading file to storage...", doneLabel: "File uploaded successfully" },
    { label: "Parsing document structure with PyMuPDF...", doneLabel: "Document parsed" },
    { label: "Extracting skills and experience sections...", doneLabel: "Skills extracted" },
    { label: "Matching against active job openings...", doneLabel: "Candidate jobs matched" },
    { label: "Calculating ATS score & recommendations...", doneLabel: "Analysis completed" }
  ];

  // Load recent resumes for quick access
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const resumes = await resumeService.getResumes();
        setRecentResumes(resumes.slice(0, 5));
      } catch (err) {
        console.error("Failed to load resumes:", err);
      }
    };
    loadResumes();
  }, []);

  // Polling hook when status is UPLOADED or PROCESSING
  useEffect(() => {
    let intervalId: any = null;

    if (resumeId && (status === "UPLOADED" || status === "PROCESSING")) {
      intervalId = setInterval(async () => {
        try {
          setStepStage((prev) => (prev < 4 ? prev + 1 : prev));

          const res = await resumeService.getResumeStatus(resumeId);
          if (res.status === "PROCESSING") {
            setStatus("PROCESSING");
          } else if (res.status === "COMPLETED") {
            setStatus("COMPLETED");
            setResumeScore(res.resumeScore || 0);
            setStepStage(4);
            success("Analysis Complete", `Resume analyzed with score ${res.resumeScore}/100.`);
            clearInterval(intervalId);
          } else if (res.status === "FAILED") {
            setStatus("FAILED");
            setErrorMessage(res.errorMessage || "Unable to parse this resume. Please check the file formatting and try again.");
            error("Analysis Failed", res.errorMessage || "Processing error occurred.");
            clearInterval(intervalId);
          }
        } catch (pollErr: any) {
          console.warn("Polling status error:", pollErr.message);
        }
      }, 1500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [resumeId, status]);

  const validateFile = (file: File): boolean => {
    const validExtensions = [".pdf", ".docx", ".doc"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      error("Invalid File Type", "Please upload a PDF (.pdf) or Word document (.docx).");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      error("File Too Large", "File size cannot exceed 10 MB.");
      return false;
    }

    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      error("No file selected", "Please choose a resume file to upload.");
      return;
    }

    setStatus("UPLOADING");
    setStepStage(0);

    try {
      const res = await resumeService.uploadResume(selectedFile);
      setResumeId(res.resumeId);
      setStatus("PROCESSING");
      setStepStage(1);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Upload failed. Please try again.";
      setStatus("FAILED");
      setErrorMessage(msg);
      error("Upload Failed", msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("IDLE");
    setResumeId(null);
    setErrorMessage(null);
    setStepStage(0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Upload your resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          PDF or DOCX · Maximum 10 MB
        </p>
      </div>

      {/* Main Upload Area */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200">
        {status === "IDLE" && (
          <div>
            {/* Drag & Drop Target */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 sm:p-10 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                <Upload className="w-5 h-5" />
              </div>

              <div className="mb-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                >
                  Choose file
                </Button>
                <p className="text-xs text-slate-500">
                  or drag and drop here
                </p>
              </div>

              <p className="text-[11px] text-slate-400">
                Supports PDF or DOCX up to 10 MB
              </p>
            </div>

            {/* Selected File Card */}
            {selectedFile && (
              <div className="mt-4 p-3.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 transition"
                  >
                    Change
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUploadAndAnalyze}
                  >
                    <span>Analyze Resume</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing State with Step-by-Step Technical Progress */}
        {(status === "UPLOADING" || status === "UPLOADED" || status === "PROCESSING") && (
          <div className="py-6 space-y-5">
            <div className="text-center">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
              <h3 className="text-base font-semibold text-slate-900">
                Analyzing resume content
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedFile?.name} · Processing asynchronously in background
              </p>
            </div>

            {/* Step list */}
            <div className="max-w-md mx-auto space-y-2 pt-2 text-xs">
              {stages.map((stage, idx) => {
                const isDone = idx < stepStage;
                const isCurrent = idx === stepStage;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded transition-colors ${
                      isDone
                        ? "text-emerald-700 bg-emerald-50/50"
                        : isCurrent
                        ? "text-blue-700 bg-blue-50/60 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{isDone ? stage.doneLabel : stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed State */}
        {status === "COMPLETED" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Analysis completed</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your resume was parsed and evaluated successfully.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 max-w-xs mx-auto">
              <p className="text-xs font-medium text-slate-500 uppercase">Calculated Resume Score</p>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                {resumeScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to={`/resume-analysis/${resumeId}`}>
                <Button variant="primary" size="md">
                  <span>View Full Analysis</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={handleReset}>
                Upload Another
              </Button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === "FAILED" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Analysis couldn't be completed
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                {errorMessage || "We couldn't process this resume right now. Your file is safe. You can try again."}
              </p>
            </div>

            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={handleReset}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Retry Analysis</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Previous Uploads Table */}
      {recentResumes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Uploads</h3>
            <Link to="/history" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all history →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Resume</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentResumes.map((r) => (
                  <tr key={r.id || r._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4 font-medium text-slate-900 truncate max-w-[200px]">
                      {r.fileName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">
                      {r.resumeScore ? `${r.resumeScore}/100` : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                          r.analysisStatus === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : r.analysisStatus === "FAILED"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {r.analysisStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {r.analysisStatus === "COMPLETED" && (
                        <Link
                          to={`/resume-analysis/${r.id || r._id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          View Report
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
