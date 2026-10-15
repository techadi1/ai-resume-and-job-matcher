import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  FileText,
  Check,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { jobService } from "../services/jobService";
import { resumeService } from "../services/resumeService";
import type { Job, Resume } from "../types";
import { useToast } from "../context/ToastContext";
import { JobNetwork3D } from "../components/3d";

export const JobMatcherPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [skill, setSkill] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [minMatch, setMinMatch] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"match" | "newest">("match");

  const { success, error } = useToast();

  // 1. Initial Load of Resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const resumeList = await resumeService.getResumes();
        setResumes(resumeList);
        if (resumeList.length > 0) {
          setSelectedResumeId(resumeList[0].id || resumeList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load user resumes:", err);
      }
    };
    fetchResumes();
  }, []);

  // 2. Fetch Jobs whenever filters change
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobService.getJobs({
        search: search || undefined,
        location: location || undefined,
        skill: skill || undefined,
        type: jobType || undefined,
        experience: experience || undefined,
        minMatch: minMatch > 0 ? minMatch : undefined,
        sortBy,
        resumeId: selectedResumeId || undefined
      });
      setJobs(res.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedResumeId, jobType, experience, minMatch, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (job: Job) => {
    try {
      const jobId = job.id || job._id;
      if (job.isSaved) {
        await jobService.unsaveJob(jobId);
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, isSaved: false } : j))
        );
        success("Job Removed", "Removed from saved jobs.");
      } else {
        await jobService.saveJob(jobId);
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, isSaved: true } : j))
        );
        success("Job Saved", "Added to your saved jobs.");
      }
    } catch (err) {
      error("Error", "Could not update saved status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Job Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover roles ranked against your technical resume profile.
          </p>
        </div>

        {/* Active Resume Selector */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 hidden sm:inline">Evaluating with:</span>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
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

      {/* Search & Filters */}
      <Card className="p-4 sm:p-5 bg-white border border-slate-200 space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, company, or tech keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Location Search */}
          <div className="relative md:col-span-4">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Location (e.g. Bengaluru, Noida, Remote)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" variant="primary" size="sm" className="w-full">
              Search
            </Button>
          </div>
        </form>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Skill Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Specific Skill</label>
            <input
              type="text"
              placeholder="e.g. React, Python"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="">Any Experience</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level (2-4 yrs)</option>
              <option value="Senior">Senior Level (5+ yrs)</option>
            </select>
          </div>

          {/* Min Match % */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Min Match</label>
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value={0}>All Listings</option>
              <option value={60}>60%+ Match</option>
              <option value={75}>75%+ Match</option>
              <option value={85}>85%+ High Match</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "newest")}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="match">Highest Match</option>
              <option value="newest">Recently Posted</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3D Compatibility Overview */}
      {!isLoading && jobs.length > 0 && (
        <JobNetwork3D
          jobs={jobs.slice(0, 6).map((j) => ({
            id: j.id || (j as any)._id,
            title: j.title,
            company: j.company,
            matchPercentage: j.matchPercentage || (j as any).matchScore || 0,
            location: j.location,
          }))}
          heightClass="h-[300px]"
          onSelectJob={(id) => {
            const el = document.getElementById(`job-card-${id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }}
        />
      )}

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {jobs.length} jobs</span>
          <span>Match scores estimated from resume NLP analysis</span>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-800">No jobs match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or lowering the minimum match threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => {
              const jobId = job.id || job._id;
              const matchScore = job.matchPercentage;
              const reqSkills = job.requiredSkills || [];

              return (
                <Card
                  key={jobId}
                  id={`job-card-${jobId}`}
                  hoverEffect
                  className="p-4 bg-white border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">{job.company}</p>
                      </div>

                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(job)}
                        className={`p-1.5 rounded border transition-colors ${
                          job.isSaved
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        }`}
                        title={job.isSaved ? "Saved Job" : "Save Job"}
                        aria-label={job.isSaved ? "Remove from saved" : "Save job"}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={job.isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span>{job.jobType || job.type || "Full-time"}</span>
                      {job.salary && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{job.salary}</span>
                        </>
                      )}
                    </div>

                    {/* Match Score Badge & ML Sub-scores */}
                    {matchScore != null && (
                      <div className="mt-3 p-2.5 rounded bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">MATCH:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              Number(matchScore) >= 75
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : Number(matchScore) >= 60
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {Math.round(Number(matchScore))}%
                          </span>
                        </div>

                        {/* ML Sub-scores Breakdown */}
                        {(job.similarityScore != null || job.skillScore != null || job.experienceScore != null) && (
                          <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-center">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Similarity</span>
                              <span className="font-medium text-slate-700">
                                {job.similarityScore != null
                                  ? `${Math.round(Number(job.similarityScore) <= 1 ? Number(job.similarityScore) * 100 : Number(job.similarityScore))}%`
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Skill Match</span>
                              <span className="font-medium text-slate-700">
                                {job.skillScore != null
                                  ? `${Math.round(Number(job.skillScore) <= 1 ? Number(job.skillScore) * 100 : Number(job.skillScore))}%`
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Experience</span>
                              <span className="font-medium text-slate-700">
                                {job.experienceScore != null
                                  ? `${Math.round(Number(job.experienceScore) <= 1 ? Number(job.experienceScore) * 100 : Number(job.experienceScore))}%`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Matched vs Missing Skills */}
                    {(job.matchedSkills || job.missingSkills) && (
                      <div className="mt-2.5 space-y-1 text-xs">
                        {job.matchedSkills && job.matchedSkills.length > 0 && (
                          <div className="flex items-start gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-500 shrink-0">Matched:</span>
                            <span className="text-slate-700 truncate">
                              {job.matchedSkills.slice(0, 3).join(", ")}
                              {job.matchedSkills.length > 3 ? ` +${job.matchedSkills.length - 3}` : ""}
                            </span>
                          </div>
                        )}
                        {job.missingSkills && job.missingSkills.length > 0 && (
                          <div className="flex items-start gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="text-slate-500 shrink-0">Missing:</span>
                            <span className="text-slate-700 truncate">
                              {job.missingSkills.slice(0, 2).join(", ")}
                              {job.missingSkills.length > 2 ? ` +${job.missingSkills.length - 2}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Required Skills tags */}
                    {!job.matchedSkills && !job.missingSkills && reqSkills.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {reqSkills.slice(0, 3).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {sk}
                          </span>
                        ))}
                        {reqSkills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-500">
                            +{reqSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{job.experience || "1-3 yrs"}</span>
                    <Link
                      to={`/jobs/${jobId}`}
                      className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
                    >
                      View Details
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
