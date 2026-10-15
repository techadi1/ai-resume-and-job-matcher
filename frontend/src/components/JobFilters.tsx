import React from "react";
import { Search, MapPin, Filter, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface JobFiltersProps {
  query: string;
  setQuery: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  workMode: string;
  setWorkMode: (val: string) => void;
  experienceLevel: string;
  setExperienceLevel: (val: string) => void;
  onReset: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  query,
  setQuery,
  location,
  setLocation,
  workMode,
  setWorkMode,
  experienceLevel,
  setExperienceLevel,
  onReset
}) => {
  return (
    <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col lg:flex-row items-center gap-3">
      {/* Search Query Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, keywords, or skills (e.g. AI Engineer, Python)..."
          className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition"
        />
      </div>

      {/* Location Filter */}
      <div className="relative w-full lg:w-48">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location..."
          className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-500 transition"
        />
      </div>

      {/* Work Mode Dropdown */}
      <div className="relative w-full lg:w-40">
        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-electric-500 cursor-pointer appearance-none"
        >
          <option value="All">All Work Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </select>
        <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Experience Level Dropdown */}
      <div className="relative w-full lg:w-44">
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-electric-500 cursor-pointer appearance-none"
        >
          <option value="All">All Experience Levels</option>
          <option value="Intern">Internship</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid Level">Mid Level</option>
          <option value="Senior">Senior</option>
        </select>
        <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Reset Filters */}
      <Button variant="ghost" size="md" onClick={onReset} className="w-full lg:w-auto whitespace-nowrap">
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
        Reset
      </Button>
    </div>
  );
};
