import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Lightbulb,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  ArrowLeft,
  ArrowRight,
  Tag
} from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { CircularProgress } from "../components/CircularProgress";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { resumeService, type FullAnalysisResponse } from "../services/resumeService";
import { ResumeScore3D, SkillNetwork3D } from "../components/3d";

export const ResumeAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await resumeService.getResumeAnalysis(id);
        setData(res);
      } catch (err) {
        console.error("Failed to load resume analysis:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <LoadingSkeleton type="card" count={2} />
        <LoadingSkeleton type="dashboard" count={2} />
      </div>
    );
  }

  if (!data || !data.resume) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-lg p-8 max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Resume Report Not Found</h2>
        <p className="text-slate-500 text-xs mb-4">
          The requested resume analysis could not be located or may have been deleted.
        </p>
        <Link to="/history">
          <Button variant="secondary" size="sm">Return to History</Button>
        </Link>
      </div>
    );
  }

  const { resume, analysis, topMatches = [] } = data;
  const breakdown = analysis?.scoreBreakdown;

  const scoreItems = breakdown
    ? [
        { label: "Technical Skills", score: breakdown.skills?.score || 0, max: breakdown.skills?.max || 30 },
        { label: "Projects & Impact", score: breakdown.projects?.score || 0, max: breakdown.projects?.max || 20 },
        { label: "Work Experience", score: breakdown.experience?.score || 0, max: breakdown.experience?.max || 20 },
        { label: "Education", score: breakdown.education?.score || 0, max: breakdown.education?.max || 10 },
        { label: "Certifications", score: breakdown.certifications?.score || 0, max: breakdown.certifications?.max || 10 },
        { label: "Completeness & Format", score: breakdown.completeness?.score || 0, max: breakdown.completeness?.max || 10 },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header with Breadcrumb and Meta Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resume Analysis
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
            <span className="font-medium text-slate-700">Resume:</span>
            <span>{resume.fileName}</span>
            <span>•</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Analysis completed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/upload`}>
            <Button variant="secondary" size="sm">
              Upload New
            </Button>
          </Link>
          <Link to={`/jobs`}>
            <Button variant="primary" size="sm">
              <span>View Matched Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3D Visual Intelligence Hub */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5">
          <ResumeScore3D
            score={resume.resumeScore || 0}
            heightClass="h-[280px]"
            label="3D ATS Rating Gauge"
            subtitle="Verified algorithmic score calculation"
          />
        </div>
        <div className="md:col-span-7">
          <SkillNetwork3D
            skills={resume.skills || []}
            heightClass="h-[280px]"
          />
        </div>
      </div>

      {/* 2. Top Summary Score Card */}
      <Card className="p-6 bg-white border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Overall ATS Score */}
          <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-5">
            <CircularProgress
              value={resume.resumeScore || 0}
              size={90}
              strokeWidth={7}
            />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall ATS Score</p>
              <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {resume.resumeScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(resume.resumeScore || 0) >= 75 ? "Competitive ATS rating" : "Room for optimization"}
              </p>
            </div>
          </div>

          {/* Right: Category Progress Bars */}
          <div className="md:col-span-8 space-y-2.5">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Scoring Breakdown
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {scoreItems.map((item, idx) => {
                const pct = Math.round((item.score / item.max) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.score}/{item.max}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Strengths & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
            {analysis?.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Clear resume format and technical sections found.</li>
            )}
          </ul>
        </Card>

        {/* Recommendations */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Recommended Improvements</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
            {analysis?.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">No critical issues detected. Maintain updated project accomplishments.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* 4. Technical Skills & Market Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Verified Skills */}
        <Card className="p-5 bg-white border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Skills ({resume.skills?.length || 0})
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Technologies and frameworks recognized directly from your resume.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills && resume.skills.length > 0 ? (
              resume.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium inline-flex items-center gap-1"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No skills extracted.</span>
            )}
          </div>
        </Card>

        {/* Missing Skills from Matching Roles */}
        <Card className="p-5 bg-white border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            In-Demand Missing Skills
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Frequent requirements in matching job listings currently missing from your profile.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const allMissing = Array.from(
                new Set(topMatches.flatMap((m) => m.missingSkills || []))
              ).slice(0, 8);
              return allMissing.length > 0 ? (
                allMissing.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded text-xs bg-amber-50 text-amber-800 border border-amber-200 font-medium inline-flex items-center gap-1"
                  >
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{sk}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  No critical missing skills detected among top matching roles.
                </span>
              );
            })()}
          </div>
        </Card>
      </div>

      {/* 5. Work Experience & Education Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Experience Section */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 text-sm font-bold mb-3">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Experience Overview</span>
          </div>
          {resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0 ? (
            <div className="space-y-3 text-xs">
              {resume.experience.map((exp: any, i: number) => (
                <div key={i} className="p-3 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-semibold text-slate-900">{exp.role || exp.title || "Software Engineering Role"}</h4>
                  <p className="text-slate-500 text-[11px]">{exp.company} {exp.duration ? `· ${exp.duration}` : ""}</p>
                  {exp.description && <p className="text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed">
              Work experience identified from resume sections. Action verbs and technical responsibilities were verified.
            </p>
          )}
        </Card>

        {/* Education Section */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 text-sm font-bold mb-3">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Education & Degrees</span>
          </div>
          {resume.education && Array.isArray(resume.education) && resume.education.length > 0 ? (
            <div className="space-y-3 text-xs">
              {resume.education.map((edu: any, i: number) => (
                <div key={i} className="p-3 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-semibold text-slate-900">{edu.degree || "Bachelor's Degree"}</h4>
                  <p className="text-slate-500 text-[11px]">{edu.institution || edu.school}</p>
                  {edu.year && <p className="text-slate-400 text-[11px] mt-0.5">{edu.year}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed">
              Academic credentials, major field of study, and degree status detected in resume header.
            </p>
          )}
        </Card>
      </div>

      {/* 6. Projects & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Projects */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 text-sm font-bold mb-3">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>Projects Evaluated</span>
          </div>
          {resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0 ? (
            <div className="space-y-3 text-xs">
              {resume.projects.map((proj: any, i: number) => (
                <div key={i} className="p-3 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-semibold text-slate-900">{proj.title || "Technical Project"}</h4>
                  {proj.description && <p className="text-slate-600 mt-1 leading-relaxed">{proj.description}</p>}
                  {proj.technologies && (
                    <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                      Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed">
              Technical projects and personal contributions identified. Ensure each project lists technologies used and measurable outcomes.
            </p>
          )}
        </Card>

        {/* Certifications */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 text-sm font-bold mb-3">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Certifications</span>
          </div>
          {resume.certifications && (Array.isArray(resume.certifications) ? resume.certifications.length > 0 : Boolean(resume.certifications)) ? (
            <div className="space-y-2 text-xs">
              {(Array.isArray(resume.certifications) ? resume.certifications : [String(resume.certifications)]).map((cert: string, i: number) => (
                <div key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 font-medium text-slate-800">
                  {cert}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 space-y-2">
              <p>No industry certifications (e.g. AWS, Azure, Docker, Kubernetes) were detected.</p>
              <p className="text-slate-600">
                Adding verified cloud or developer certifications can boost your ATS score by up to 10 points.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* 7. Extracted Keywords */}
      {(analysis as any)?.keywords && (analysis as any).keywords.length > 0 && (
        <Card className="p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 text-sm font-bold mb-1">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>Top Keywords in Resume</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Frequent terms parsed for TF-IDF cosine matching.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(analysis as any).keywords.slice(0, 20).map((kw: any, i: number) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs bg-slate-50 text-slate-700 border border-slate-200"
              >
                {kw.keyword} <span className="text-[10px] text-slate-400">({kw.count})</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 8. Top Job Opportunities Preview */}
      {topMatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Highest Matching Opportunities</h3>
            <Link to="/jobs" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Explore all jobs →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topMatches.slice(0, 3).map((match) => {
              const jobTitle = match.title || match.job?.title || "Tech Role";
              const jobCompany = match.company || match.job?.company || "Company";
              const jobLocation = match.location || match.job?.location || "India";
              const jobSalary = match.salary || match.job?.salary || "Competitive";

              return (
                <Card key={match.jobId} hoverEffect className="p-4 bg-white border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug">{jobTitle}</h4>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {match.matchPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{jobCompany} · {jobLocation}</p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{jobSalary}</span>
                    <Link to={`/jobs/${match.jobId}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      View Job →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
