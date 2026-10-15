import { api } from "./api";

export interface DashboardData {
  userName: string;
  totalResumes: number;
  latestResume: {
    id: string;
    fileName: string;
    resumeScore: number;
    createdAt: string;
  } | null;
  resumeScore: number;
  skillsDetectedCount: number;
  skillsDetected: string[];
  jobsMatchedCount: number;
  missingSkillsCount: number;
  missingSkills: string[];
  topJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    matchPercentage: number;
    similarityScore: number;
    skillScore: number;
    experienceScore: number;
    matchedSkills: string[];
    missingSkills: string[];
  }>;
  recommendedSkills: Array<{
    skill: string;
    frequency: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    category: string;
    whyMatters: string;
    jobsRequiring: string[];
    learningPath: string[];
  }>;
  scoreBreakdown: {
    skills: { score: number; max: number };
    projects: { score: number; max: number };
    experience: { score: number; max: number };
    education: { score: number; max: number };
    certifications: { score: number; max: number };
    completeness: { score: number; max: number };
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  matchDistribution: Array<{ range: string; count: number }>;
  skillDistribution: Array<{ name: string; value: number }>;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardData> {
    const res = await api.get<{ success: boolean; data?: DashboardData } & DashboardData>("/dashboard/summary");
    return res.data;
  },
};
