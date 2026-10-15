import { api } from "./api";
import type { SkillRecommendation } from "../types";

export interface SkillGapResponse {
  success: boolean;
  resumeSkills: string[];
  totalMissingSkills: number;
  topMissingSkills: string[];
  recommendedSkills: SkillRecommendation[];
}

export const skillGapService = {
  async getSkillGap(resumeId: string): Promise<SkillGapResponse> {
    const res = await api.get<SkillGapResponse>(`/resumes/${resumeId}/skill-gap`);
    return res.data;
  },
};
