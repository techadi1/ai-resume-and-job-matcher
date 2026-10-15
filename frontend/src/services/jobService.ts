import { api } from "./api";
import type { Job, SavedJobItem } from "../types";

export interface JobFilterParams {
  search?: string;
  location?: string;
  skill?: string;
  type?: string;
  experience?: string;
  minMatch?: number;
  sortBy?: "match" | "newest";
  resumeId?: string;
}

export interface JobsResponse {
  success: boolean;
  count: number;
  targetResumeId?: string;
  jobs: Job[];
}

export interface RecommendedJobsResponse {
  success: boolean;
  source?: string;
  resumeId?: string;
  recommendedJobs: Job[];
}

export interface SavedJobsResponse {
  success: boolean;
  count: number;
  savedJobs: SavedJobItem[];
}

export const jobService = {
  async getJobs(params?: JobFilterParams): Promise<JobsResponse> {
    const res = await api.get<JobsResponse>("/jobs", { params });
    return res.data;
  },

  async getJob(id: string): Promise<Job> {
    const res = await api.get<{ success: boolean; job: Job }>(`/jobs/${id}`);
    return res.data.job;
  },

  async getRecommendedJobs(resumeId?: string): Promise<Job[]> {
    const res = await api.get<RecommendedJobsResponse>("/jobs/recommended", {
      params: resumeId ? { resumeId } : {},
    });
    return res.data.recommendedJobs || [];
  },

  async saveJob(jobId: string): Promise<void> {
    await api.post(`/jobs/${jobId}/save`);
  },

  async unsaveJob(jobId: string): Promise<void> {
    await api.delete(`/jobs/${jobId}/save`);
  },

  async getSavedJobs(): Promise<SavedJobItem[]> {
    const res = await api.get<SavedJobsResponse>("/jobs/saved");
    return res.data.savedJobs || [];
  },
};
