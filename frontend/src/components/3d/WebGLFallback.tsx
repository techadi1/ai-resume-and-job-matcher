import React from "react";
import { FileText, Cpu, CheckCircle2 } from "lucide-react";

interface WebGLFallbackProps {
  title?: string;
  subtitle?: string;
  score?: number;
  skills?: string[];
  matchedRole?: string;
  matchPercentage?: number;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({
  title = "Interactive Data Model",
  subtitle = "High-performance career and resume intelligence environment",
  score = 84,
  skills = ["Python", "React", "Node.js", "MongoDB", "Docker", "AWS"],
  matchedRole = "Software Engineer",
  matchPercentage = 87,
}) => {
  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl bg-navy-950 border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-depth-2">
      {/* Background subtle technical grid */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-electric/15 border border-electric/30 flex items-center justify-center text-electric">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          2D Accelerated
        </span>
      </div>

      {/* Central Visual Document */}
      <div className="relative z-10 my-4 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Abstract Resume Card */}
        <div className="w-48 bg-navy-900 border border-slate-700/60 rounded-xl p-4 shadow-depth-2">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-electric" />
            <div className="h-2 w-16 bg-slate-600 rounded" />
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="h-1.5 w-full bg-slate-700 rounded" />
            <div className="h-1.5 w-4/5 bg-slate-700/80 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-700/60 rounded" />
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Score</span>
            <span className="text-xs font-bold text-electric">{score}/100</span>
          </div>
        </div>

        {/* Orbiting Skill Chips */}
        <div className="flex flex-wrap gap-1.5 max-w-[240px] justify-center">
          {skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/70 shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-tealAccent" />
          <span>Top Match: <strong className="text-white">{matchedRole}</strong></span>
        </div>
        <span className="font-bold text-tealAccent">{matchPercentage}% Match</span>
      </div>
    </div>
  );
};
