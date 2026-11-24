import { api } from "./api";
import type { Resume, AnalysisResult, JobMatch } from "../types";

export interface UploadResponse {
  success: boolean;
  message: string;
  resumeId: string;
  fileName: string;
  analysisStatus: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export interface StatusResponse {
  success: boolean;
  resumeId: string;
  status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  resumeScore: number;
  errorMessage?: string;
  updatedAt: string;
}

export interface FullAnalysisResponse {
  success: boolean;
  source: "cache" | "database";
  resume: Resume;
  analysis: AnalysisResult;
  topMatches: JobMatch[];
}

export const resumeService = {
  async uploadResume(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await api.post<any>("/resumes/upload", formData, {
      headers: {
        "X-File-Name": encodeURIComponent(file.name),
        "X-File-Size": file.size.toString(),
        "X-File-Type": file.type || "application/pdf",
      },
    });
    const d = res.data;
    const inner = d.data || {};
    return {
      success: d.success,
      message: d.message,
      resumeId: d.resumeId || inner.resumeId || d.id || inner._id,
      fileName: d.fileName || inner.fileName || file.name,
      analysisStatus: d.analysisStatus || inner.status || "PROCESSING",
    };
  },

  async getResumes(): Promise<Resume[]> {
    const res = await api.get<{ success: boolean; count: number; resumes: Resume[] }>("/resumes");
    return res.data.resumes || [];
  },

  async getResume(id: string): Promise<Resume> {
    const res = await api.get<{ success: boolean; resume: Resume }>(`/resumes/${id}`);
    return res.data.resume;
  },

  async getResumeStatus(id: string): Promise<StatusResponse> {
    const res = await api.get<any>(`/resumes/${id}/status`);
    const d = res.data;
    const inner = d.data || {};
    return {
      success: d.success,
      resumeId: d.resumeId || inner.resumeId || id,
      status: d.status || inner.status || "PROCESSING",
      resumeScore: d.resumeScore ?? inner.score ?? inner.resumeScore ?? 0,
      errorMessage: d.errorMessage || inner.error || undefined,
      updatedAt: d.updatedAt || inner.updatedAt || new Date().toISOString(),
    };
  },

  async getResumeAnalysis(id: string): Promise<FullAnalysisResponse> {
    const res = await api.get<any>(`/resumes/${id}/analysis`);
    const d = res.data;
    const inner = d.data || {};
    const resume = d.resume || inner.resume || d;
    const analysis = d.analysis || inner.analysis || {};
    const topMatches = d.topMatches || inner.topMatches || [];
    return {
      success: d.success,
      source: d.source || "database",
      resume,
      analysis,
      topMatches,
    };
  },

  async reanalyzeResume(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post(`/resumes/${id}/reanalyze`);
    return res.data;
  },

  async deleteResume(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },
};
