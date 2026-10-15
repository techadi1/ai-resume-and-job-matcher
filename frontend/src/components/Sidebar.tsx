import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  History,
  Briefcase,
  Bookmark,
  Compass,
  User,
  Settings,
  LogOut,
  FileCheck2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const navSections = [
    {
      label: "Overview",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Resume",
      items: [
        { to: "/upload", label: "Analyze Resume", icon: FileText },
        { to: "/history", label: "Analysis History", icon: History },
      ],
    },
    {
      label: "Jobs",
      items: [
        { to: "/jobs", label: "Find Jobs", icon: Briefcase },
        { to: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
      ],
    },
    {
      label: "Career",
      items: [
        { to: "/skills", label: "Skills & Gaps", icon: Compass },
      ],
    },
    {
      label: "Account",
      items: [
        { to: "/profile", label: "Profile", icon: User },
        { to: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 bottom-0 z-30">
      {/* Brand Header */}
      <NavLink to="/dashboard" className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 tracking-tight block">
            Resume<span className="text-blue-600">Match</span>
          </span>
          <span className="block text-[11px] text-slate-500 font-medium -mt-0.5">
            Student & Career Matcher
          </span>
        </div>
      </NavLink>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
