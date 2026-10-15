import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Briefcase, Bookmark, Compass, History } from "lucide-react";

export const MobileNav: React.FC = () => {
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Analyze", icon: FileText },
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/saved-jobs", label: "Saved", icon: Bookmark },
    { to: "/skills", label: "Skills", icon: Compass },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-sm">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2 rounded-md text-[11px] font-medium transition-colors ${
                isActive ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
