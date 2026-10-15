import React from "react";
import { Link, Outlet } from "react-router-dom";
import { FileCheck2, ArrowLeft } from "lucide-react";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Resume<span className="text-blue-600">Match</span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 my-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-400 border-t border-slate-200">
        <p>© 2026 ResumeMatch · Practical Resume Analysis & Job Matching Platform</p>
      </footer>
    </div>
  );
};
