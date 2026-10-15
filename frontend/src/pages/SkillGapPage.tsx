import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

import { Card } from "../components/Card";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { skillGapService, type SkillGapResponse } from "../services/skillGapService";
import { resumeService } from "../services/resumeService";
import type { Resume } from "../types";
import { SkillGap3D, CareerPath3D } from "../components/3d";

export const SkillGapPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [gapData, setGapData] = useState<SkillGapResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const resumesData = await resumeService.getResumes();
        setResumes(resumesData);
        if (resumesData && resumesData.length > 0) {
          const firstId = resumesData[0].id || resumesData[0]._id;
          setSelectedResumeId(firstId);
          const gap = await skillGapService.getSkillGap(firstId);
          setGapData(gap);
        }
      } catch (err) {
        console.error("Failed to load skill gap data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleResumeChange = async (id: string) => {
    setSelectedResumeId(id);
    setIsLoading(true);
    try {
      const gap = await skillGapService.getSkillGap(id);
      setGapData(gap);
    } catch (err) {
      console.error("Error switching resume:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <LoadingSkeleton type="card" count={2} />
        <LoadingSkeleton type="dashboard" count={2} />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        title="No resumes available"
        description="Upload a resume first to run automated skill gap analysis against target tech jobs."
        actionText="Upload Resume"
        onAction={() => (window.location.href = "/upload")}
      />
    );
  }

  const userSkills: string[] = gapData?.resumeSkills || [];
  const missingSkills: string[] = gapData?.topMissingSkills || [];
  const recommendedSkills = gapData?.recommendedSkills || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Skill Gap & Learning Pathways
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Identify missing technical skills that directly increase your job match percentages.
          </p>
        </div>

        {/* Resume Selector */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 hidden sm:inline">Active Resume:</span>
            <select
              value={selectedResumeId}
              onChange={(e) => handleResumeChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              {resumes.map((r) => (
                <option key={r.id || r._id} value={r.id || r._id}>
                  {r.fileName} ({r.resumeScore}/100)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3D Dual-Cluster Visualization */}
      <SkillGap3D
        ownedSkills={userSkills}
        missingSkills={missingSkills}
        heightClass="h-[340px]"
      />

      {/* 1. Comparison: Skills You Have vs Skills To Acquire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Skills you already have */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Skills you already have ({userSkills.length})</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Competencies recognized from your projects and work experience.
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {userSkills.length > 0 ? (
              userSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                >
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No skills parsed from this resume yet.</span>
            )}
          </div>
        </Card>

        {/* Skills that could improve matches */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Skills that could improve your matches ({missingSkills.length})</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Technologies frequently required by jobs in your domain.
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {missingSkills.length > 0 ? (
              missingSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                >
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No missing skills detected for current candidate jobs.</span>
            )}
          </div>
        </Card>
      </div>

      {/* 3D Career Progression Timeline */}
      <CareerPath3D heightClass="h-[300px]" />

      {/* 2. Prioritized Skill Roadmaps */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recommended Learning Roadmaps</h2>
          <p className="text-xs text-slate-500">
            Step-by-step curriculum to close skill gaps and improve resume match scores.
          </p>
        </div>

        {recommendedSkills.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No major skill gaps identified</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your resume aligns well with all active tech positions in the database.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendedSkills.map((item, idx) => {
              const priorityColor =
                item.priority === "HIGH"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : item.priority === "MEDIUM"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <Card key={idx} className="p-5 bg-white border border-slate-200 space-y-3">
                  {/* Skill Title & Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{item.skill}</h3>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${priorityColor}`}>
                        {item.priority} Priority
                      </span>
                    </div>

                    <span className="text-xs text-slate-500">
                      Required by <strong>{item.frequency || 1}</strong> recommended jobs
                    </span>
                  </div>

                  {/* Why it matters */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-1">Why learn it?</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.whyMatters || `Adding ${item.skill} to your projects demonstrates hands-on competence in high-demand tech stacks.`}
                    </p>
                  </div>

                  {/* Recommended learning path */}
                  {item.learningPath && item.learningPath.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Recommended learning path:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        {item.learningPath.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2"
                          >
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="text-slate-700 leading-snug">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs requiring it */}
                  {item.jobsRequiring && item.jobsRequiring.length > 0 && (
                    <div className="pt-2 text-[11px] text-slate-500">
                      <span>Positions requesting this skill: </span>
                      <strong className="text-slate-700">
                        {item.jobsRequiring.join(", ")}
                      </strong>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
