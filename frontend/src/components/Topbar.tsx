import React from "react";
import { Link } from "react-router-dom";
import { Search, User, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Topbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Search Input Placeholder */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-500 w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">Search jobs, skills, or resumes...</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          to="/upload"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-medium transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Upload Resume</span>
        </Link>

        {/* User Account Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-slate-50 transition border border-slate-200"
        >
          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden md:inline">
            {user?.name || "My Account"}
          </span>
        </Link>
      </div>
    </header>
  );
};
