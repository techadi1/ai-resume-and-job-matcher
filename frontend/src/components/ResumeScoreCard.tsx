import React from "react";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Card } from "./Card";
import { CircularProgress } from "./CircularProgress";
import type { AnalysisResult } from "../types";

interface ResumeScoreCardProps {
  analysis: AnalysisResult;
}

export const ResumeScoreCard: React.FC<ResumeScoreCardProps> = ({ analysis }) => {
  const breakdown = analysis.scoreBreakdown;

  const categories = breakdown
    ? [
        { label: "Technical Skills", score: Math.round((breakdown.skills.score / breakdown.skills.max) * 100), color: "bg-blue-600" },
        { label: "Work Experience", score: Math.round((breakdown.experience.score / breakdown.experience.max) * 100), color: "bg-blue-600" },
        { label: "Projects", score: Math.round((breakdown.projects.score / breakdown.projects.max) * 100), color: "bg-blue-600" },
        { label: "Education", score: Math.round((breakdown.education.score / breakdown.education.max) * 100), color: "bg-blue-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top ATS Score Summary */}
      <Card className="bg-white border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <CircularProgress
            value={analysis.overallScore}
            size={110}
            strokeWidth={8}
          />
          <div className="text-center md:text-left flex-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
              Calculated ATS Score
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {analysis.overallScore >= 80
                ? "Strong ATS Alignment"
                : analysis.overallScore >= 65
                ? "Good Competitive Foundation"
                : "Optimization Recommended"}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Your resume scored <strong className="text-slate-900">{analysis.overallScore}/100</strong> based on technical skill coverage, project descriptions, and structural ATS completeness.
            </p>
          </div>
        </div>
      </Card>

      {/* Sub-scores Category Breakdown */}
      {categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat, idx) => (
            <Card key={idx} className="p-3.5 bg-white border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">{cat.label}</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{Math.round(cat.score)}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Strengths, Weaknesses & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/80">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((str: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No specific strengths identified.</li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Areas for Improvement</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
              analysis.weaknesses.map((weak: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{weak}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No major weaknesses detected.</li>
            )}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/80">
          <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span>Recommendations</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {analysis.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No recommendations available.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
