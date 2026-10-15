export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  education?: string;
  careerInterests?: string[];
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ScoreItem {
  score: number;
  max: number;
}

export interface ScoreBreakdown {
  skills: ScoreItem;
  projects: ScoreItem;
  experience: ScoreItem;
  education: ScoreItem;
  certifications: ScoreItem;
  completeness: ScoreItem;
}

export interface SkillRecommendation {
  skill: string;
  frequency: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  whyMatters: string;
  jobsRequiring: string[];
  learningPath: string[];
}

export interface SkillGapData {
  totalMissingSkills: number;
  topMissingSkills: string[];
  recommendedSkills: SkillRecommendation[];
}

export interface AnalysisResult {
  overallScore: number;
  scoreBreakdown?: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillGap?: SkillGapData;
  keywords?: Array<{ keyword: string; count: number }>;
}

export interface Resume {
  id: string;
  _id: string;
  userId?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  candidateName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills: string[];
  education?: any;
  experience?: any;
  projects?: any;
  certifications?: any;
  resumeScore: number;
  analysisStatus: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  analysisResult?: AnalysisResult;
  errorMessage?: string;
  jobsMatchedCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  jobType?: string;
  workMode?: string;
  salary?: string;
  description: string;
  responsibilities?: string[];
  requiredSkills: string[];
  preferredSkills?: string[];
  experience: string;
  education?: string;
  applicationUrl?: string;
  postedDate?: string;
  isSaved?: boolean;
  matchPercentage?: number | null;
  similarityScore?: number | null;
  skillScore?: number | null;
  experienceScore?: number | null;
  matchedSkills?: string[];
  missingSkills?: string[];
  missingRequiredSkills?: string[];
}

export interface JobMatch {
  id?: string;
  _id?: string;
  userId?: string;
  resumeId: string;
  jobId: string;
  job?: Job;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  matchPercentage: number;
  similarityScore: number;
  skillScore: number;
  experienceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  missingRequiredSkills?: string[];
  createdAt?: string;
}

export interface SavedJobItem {
  id: string;
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  jobType?: string;
  workMode?: string;
  salary?: string;
  experience: string;
  description: string;
  applicationUrl?: string;
  requiredSkills?: string[];
  matchPercentage?: number | null;
  matchedSkills?: string[];
  missingSkills?: string[];
  savedAt?: string;
  isSaved: boolean;
}
