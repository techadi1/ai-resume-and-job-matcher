import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Target,
  FileText,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { CircularProgress } from "../components/CircularProgress";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { dashboardService, type DashboardData } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import {
  ResumeScore3D,
  SkillNetwork3D,
  JobNetwork3D,
} from "../components/3d";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const summary = await dashboardService.getSummary();
        setData(summary);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="dashboard" count={2} />
      </div>
    );
  }

  const hasResume = data && data.latestResume;
  const userName = data?.userName || user?.name || "there";

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Score breakdown bars
  const scoreBreakdownData = data?.scoreBreakdown
    ? [
        { name: "Skills", score: data.scoreBreakdown.skills?.score || 0, max: 30 },
        { name: "Projects", score: data.scoreBreakdown.projects?.score || 0, max: 20 },
        { name: "Experience", score: data.scoreBreakdown.experience?.score || 0, max: 20 },
        { name: "Education", score: data.scoreBreakdown.education?.score || 0, max: 10 },
        { name: "Certifications", score: data.scoreBreakdown.certifications?.score || 0, max: 10 },
        { name: "Completeness", score: data.scoreBreakdown.completeness?.score || 0, max: 10 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what we found from your latest resume analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/upload">
            <Button variant="primary" size="md">
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Upload Resume</span>
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary" size="md">
              <Briefcase className="w-4 h-4 mr-1.5" />
              <span>Browse Jobs</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Four Simple Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Resume Score */}
        <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Resume Score
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {data?.resumeScore || 0}<span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {(data?.resumeScore || 0) >= 75 ? "Strong ATS alignment" : "Needs optimization"}
            </p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center">
            <CircularProgress
              value={data?.resumeScore || 0}
              size={48}
              strokeWidth={4}
            />
          </div>
        </Card>

        {/* Metric 2: Jobs Matched */}
        <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Jobs Matched
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {data?.jobsMatchedCount || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Above 60% match threshold
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>

        {/* Metric 3: Skills Detected */}
        <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Skills Detected
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {data?.skillsDetectedCount || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified technical skills
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <Target className="w-5 h-5" />
          </div>
        </Card>

        {/* Metric 4: Skill Gaps */}
        <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Skill Gaps
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {data?.missingSkillsCount || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Identified in matching jobs
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {!hasResume ? (
        /* Empty State */
        <EmptyState
          title="No resume analyzed yet"
          description="Upload your latest resume in PDF or DOCX format to see your technical skills, ATS score, and recommended jobs."
          actionText="Upload Resume"
          onAction={() => navigate("/upload")}
        />
      ) : (
        <>
          {/* 3D Career Intelligence Hub (3D ATS Gauge + 3D Skill Orbit) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <ResumeScore3D
                score={data.resumeScore || 0}
                label="3D ATS Compatibility Score"
                subtitle="Calculated across skills, experience, and completeness"
                heightClass="h-[300px]"
              />
            </div>
            <div className="lg:col-span-7">
              <SkillNetwork3D
                skills={data.skillsDetected || []}
                missingSkills={data.missingSkills || []}
                heightClass="h-[300px]"
              />
            </div>
          </div>

          {/* 3. Latest Analysis Summary & Score Criteria Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Latest Resume Report */}
            <Card className="lg:col-span-2 p-5 bg-white border border-slate-200">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {data.latestResume?.fileName}
                    </h2>
                    <span className="text-xs text-slate-400">
                      Analyzed on {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/resume-analysis/${data.latestResume?.id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
                >
                  Full Analysis Report
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-3.5 rounded-md bg-emerald-50/50 border border-emerald-200/80">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {data.strengths.slice(0, 3).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-md bg-amber-50/50 border border-amber-200/80">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Areas for Improvement</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {data.weaknesses.slice(0, 3).map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verified Skills */}
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  Verified Skills in Resume ({data.skillsDetected.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {data.skillsDetected.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Right Col: ATS Score Breakdown */}
            <Card className="p-5 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                  Evaluation
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-3">ATS Score Breakdown</h3>

                <div className="space-y-2.5">
                  {scoreBreakdownData.map((item, idx) => {
                    const pct = Math.round((item.score / item.max) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{item.name}</span>
                          <span className="text-slate-500">
                            {item.score} / {item.max} pts
                          </span>
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Calculated ATS Score:</span>
                <span className="font-bold text-slate-900 text-sm">{data.resumeScore} / 100</span>
              </div>
            </Card>
          </div>

          {/* 4. Top Matched Jobs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended Jobs</h3>
                <p className="text-xs text-slate-500">
                  Ranked by 40% Text Similarity + 40% Skill Match + 20% Experience Relevance.
                </p>
              </div>
              <Link
                to="/jobs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all ({data.jobsMatchedCount}) →
              </Link>
            </div>

            {/* 3D Job Compatibility Network */}
            {data.topJobs && data.topJobs.length > 0 && (
              <JobNetwork3D
                jobs={data.topJobs.map((j) => ({
                  id: j.id,
                  title: j.title,
                  company: j.company,
                  matchPercentage: j.matchPercentage || 0,
                  location: j.location,
                }))}
                heightClass="h-[320px]"
                onSelectJob={(id) => navigate(`/jobs/${id}`)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topJobs.map((job) => (
                <Card key={job.id} hoverEffect className="p-4 bg-white border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm leading-snug">{job.title}</h4>
                        <p className="text-xs text-slate-500">{job.company} · {job.location}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {job.matchPercentage}%
                      </span>
                    </div>

                    {/* Matched / Missing skills quick info */}
                    <div className="mt-2.5 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <span className="font-semibold">Matched:</span>
                        <span className="text-slate-600 truncate">
                          {job.matchedSkills.slice(0, 3).join(", ") || "General background"}
                        </span>
                      </div>
                      {job.missingSkills.length > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <span className="font-semibold">Missing:</span>
                          <span className="text-slate-600 truncate">
                            {job.missingSkills.slice(0, 3).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {job.salary || "Competitive"}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Job →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 5. Skill Gap Priority Card & Responsible AI Notice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Skill Gaps & Learning Paths */}
            <Card className="p-5 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">High-Priority Skill Gaps</h3>
                  <p className="text-xs text-slate-500">Skills most frequently required by your matching jobs</p>
                </div>
                <Link to="/skills" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Full Learning Roadmap →
                </Link>
              </div>

              {data.recommendedSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No major skill gaps identified for your target roles.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.recommendedSkills.slice(0, 4).map((rec, i) => (
                    <div key={i} className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{rec.skill}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {rec.priority} Priority
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mb-1.5">{rec.whyMatters}</p>
                      {rec.learningPath && rec.learningPath[0] && (
                        <p className="text-slate-500 text-[11px]">
                          <strong>Next step:</strong> {rec.learningPath[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Practical Technical Competency Distribution */}
            <Card className="p-5 bg-white border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Technical Skill Relevance</h3>
              <p className="text-xs text-slate-500 mb-4">Competency depth identified from resume section frequency</p>

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.skillDistribution.slice(0, 6)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} width={80} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, "Relevance"]}
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Responsible AI Presentation Disclaimer */}
          <div className="p-3 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Match scores and skill rankings are estimates computed based on the information available in your resume and active job descriptions.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
