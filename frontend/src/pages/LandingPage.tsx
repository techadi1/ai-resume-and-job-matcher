import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Target,
  ArrowRight,
  CheckCircle2,
  BarChart2,
  Cpu
} from "lucide-react";
import { Button } from "../components/Button";
import {
  HeroScene,
  JobNetwork3D,
  SkillGap3D,
  CareerPath3D,
} from "../components/3d";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 selection:bg-electric selection:text-white">
      {/* 1. Sophisticated Navbar */}
      <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center text-white shadow-glow-blue">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Resume<span className="text-electric">Match</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <a href="#story" className="hover:text-white transition">3D Story</a>
            <a href="#analysis" className="hover:text-white transition">Analysis</a>
            <a href="#matching" className="hover:text-white transition">Job Matching</a>
            <a href="#skill-gap" className="hover:text-white transition">Skill Gaps</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="bg-electric hover:bg-electric-hover text-white shadow-glow-blue border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: 3D Career Intelligence Environment */}
      <section className="relative bg-navy-950 text-white pt-12 sm:pt-16 pb-20 border-b border-slate-800 overflow-hidden">
        {/* Subtle Ambient Background Lighting */}
        <div
          className="absolute -top-32 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #14B8A6 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-6">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                <span className="uppercase tracking-wider text-[11px] text-electric">AI Career Analysis</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-white tracking-tight leading-[1.12] mb-5">
                Your resume. <br />
                Your skills. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-blue-400 to-tealAccent">
                  Your next opportunity.
                </span>
              </h1>

              <p className="text-base text-slate-300 leading-relaxed mb-8 max-w-xl">
                Analyze your resume, understand your strengths, identify skill gaps, and discover jobs that actually match your profile.
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <Link to="/upload">
                  <Button variant="primary" size="lg" className="bg-electric hover:bg-electric-hover text-white shadow-depth-2 flex items-center gap-2">
                    Analyze My Resume
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="secondary" size="lg" className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800">
                    Explore Jobs
                  </Button>
                </Link>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Real-time NLP Parsing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent" />
                  <span>Vector Match Scoring</span>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Scene */}
            <div className="lg:col-span-7">
              <HeroScene
                score={84}
                matchRate={87}
                candidateName="Aditya Gupta"
                targetRole="Software Engineer"
                skills={["Python", "React", "Node.js", "MongoDB", "Docker", "AWS"]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Strip */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">01</span>
            <p className="text-sm font-bold text-slate-900">AI Resume Analysis</p>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive ATS breakdown</p>
          </div>
          <div className="p-3 border-l border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">02</span>
            <p className="text-sm font-bold text-slate-900">Skill Detection</p>
            <p className="text-xs text-slate-500 mt-0.5">Categorized tech competencies</p>
          </div>
          <div className="p-3 border-l border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">03</span>
            <p className="text-sm font-bold text-slate-900">Job Matching</p>
            <p className="text-xs text-slate-500 mt-0.5">TF-IDF vector cosine matching</p>
          </div>
          <div className="p-3 border-l border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">04</span>
            <p className="text-sm font-bold text-slate-900">Skill Gap Analysis</p>
            <p className="text-xs text-slate-500 mt-0.5">5-step targeted learning paths</p>
          </div>
        </div>
      </section>

      {/* 4. 3D Story Section: Resume -> Skills -> Analysis -> Jobs */}
      <section id="story" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-electric block mb-2">
            The Analysis Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How ResumeMatch connects your background to opportunities
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A transparent engineering workflow turning unstructured resume text into actionable career intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-depth-1 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-electric mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
            <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">1. Resume Parsing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts text from PDF/DOCX documents, segmenting experience, education, and credentials cleanly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-depth-1 relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-tealAccent mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
            <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">2. Skill Extraction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Matches tech keywords across modern libraries (React, Python, Docker) into organized competency categories.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-depth-1 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
            <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">3. Score Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates a weighted ATS score assessing skills depth, action verbs, project details, and completeness.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-depth-1 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 4</span>
            <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">4. Job Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes TF-IDF cosine compatibility against live market requirements with matched and missing skill indicators.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Job Matching: 3D Job Network + Normal Job Cards */}
      <section id="matching" className="py-16 bg-slate-100/60 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-electric block mb-1">
                3D Network Visualization
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Job Compatibility Network
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Visualizing opportunity compatibility as a radial network around your verified skills.
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="secondary" size="sm">
                View All 40+ Seed Jobs
              </Button>
            </Link>
          </div>

          {/* 3D Visualization */}
          <div className="mb-8">
            <JobNetwork3D heightClass="h-[360px]" />
          </div>

          {/* Normal HTML Job Cards Underneath (Requirement 11) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Software Engineer</h4>
                  <p className="text-xs font-semibold text-slate-600">Microsoft · Noida, India (Hybrid)</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  87% Match
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1 mb-3">₹8–14 LPA · Full-time</p>
              <div className="space-y-2 mb-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["Python", "React", "Node.js", "SQL"].map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Missing:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium">
                      Docker
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to="/jobs" className="text-xs font-semibold text-electric hover:underline flex items-center gap-1">
                  View Job <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">Microsoft Careers</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Backend Engineer</h4>
                  <p className="text-xs font-semibold text-slate-600">Razorpay · Bengaluru, India (Hybrid)</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  84% Match
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1 mb-3">₹14–22 LPA · Full-time</p>
              <div className="space-y-2 mb-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["Node.js", "Express", "PostgreSQL", "Redis"].map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Missing:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium">
                      Kafka
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to="/jobs" className="text-xs font-semibold text-electric hover:underline flex items-center gap-1">
                  View Job <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">Razorpay Jobs</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Full Stack Developer</h4>
                  <p className="text-xs font-semibold text-slate-600">Flipkart · Bengaluru, India (Onsite)</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  81% Match
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1 mb-3">₹16–25 LPA · Full-time</p>
              <div className="space-y-2 mb-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["React", "TypeScript", "Node.js", "MongoDB"].map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Missing:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium">
                      Next.js
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to="/jobs" className="text-xs font-semibold text-electric hover:underline flex items-center gap-1">
                  View Job <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">Flipkart Careers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Skill Gap & Career Progression 3D */}
      <section id="skill-gap" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-electric block mb-2">
            Strategic Growth
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Close high-impact skill gaps
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See the exact skills that distinguish your profile from higher-paying roles, mapped into dual clusters and a directional progression path.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-electric" />
              Dual-Cluster Skill Differential (3D)
            </h3>
            <SkillGap3D
              ownedSkills={["Python", "React", "Node.js", "MongoDB", "SQL", "Git"]}
              missingSkills={["Docker", "AWS", "Kubernetes", "CI/CD"]}
              heightClass="h-[360px]"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tealAccent" />
              Career Progression Vector (3D)
            </h3>
            <CareerPath3D heightClass="h-[360px]" />
          </div>
        </div>

        {/* Actionable Learning Path Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-slate-900">Docker</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                High Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Required by 42 recommended developer roles</p>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
              <li>Docker fundamentals & architecture</li>
              <li>Building custom Dockerfiles</li>
              <li>Docker Compose multi-container networks</li>
              <li>Containerized production deployment</li>
            </ol>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-slate-900">AWS Cloud</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                High Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Required by 38 recommended roles</p>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
              <li>Core AWS primitives (EC2, S3, IAM)</li>
              <li>Container orchestration with ECS/EKS</li>
              <li>Serverless Lambda microservices</li>
              <li>CloudWatch observability & monitoring</li>
            </ol>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-slate-900">Kubernetes</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Medium Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Required by 26 distributed systems roles</p>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
              <li>Pods, Deployments, and Services</li>
              <li>ConfigMaps and Secrets management</li>
              <li>Helm chart packaging</li>
              <li>Ingress controllers & networking</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 7. How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Get started in 3 simple steps</h2>
            <p className="text-sm text-slate-500 mt-1">Free, instantaneous, and private document processing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-electric mx-auto flex items-center justify-center font-black text-lg mb-4 border border-blue-100">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Upload Resume</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop your current PDF or DOCX file (up to 10 MB). Safe local storage with zero third-party sharing.
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-tealAccent mx-auto flex items-center justify-center font-black text-lg mb-4 border border-teal-100">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Review 3D Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Examine your score, extracted skills, and visual competency map calculated by our NLP parser.
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-black text-lg mb-4 border border-indigo-100">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Apply with High Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore recommended openings with high match scores and tailored learning paths for missing skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action (Navy + Controlled Lighting) */}
      <section className="bg-navy-950 text-white py-16 sm:py-20 border-t border-slate-800 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle at center, #3B82F6 0%, transparent 65%)" }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-tealAccent block mb-3">
            Start Your Analysis Today
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Ready to understand your resume?
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Upload your resume now to explore your 3D skill network, ATS score breakdown, and discover matching software opportunities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/upload">
              <Button size="lg" className="bg-electric hover:bg-electric-hover text-white shadow-depth-2 px-8">
                Analyze My Resume
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800">
                Create Free Account
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-6">
            Match scores are estimates based on resume content and job specifications.
          </p>
        </div>
      </section>

      {/* 9. Minimal Professional Footer */}
      <footer className="bg-navy-950 border-t border-slate-800/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-electric flex items-center justify-center text-white">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">ResumeMatch</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Career Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/jobs" className="hover:text-slate-200 transition">Job Search</Link>
            <Link to="/upload" className="hover:text-slate-200 transition">Analyze Resume</Link>
            <Link to="/login" className="hover:text-slate-200 transition">Sign In</Link>
          </div>
          <p className="text-slate-500">
            © {new Date().getFullYear()} ResumeMatch. Designed for students and job seekers.
          </p>
        </div>
      </footer>
    </div>
  );
};
