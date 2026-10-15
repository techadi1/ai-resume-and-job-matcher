import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-electric-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Verifying CareerAI Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If children provided, render them (layout wrapper pattern)
  // Otherwise render Outlet for nested route pattern
  return children ? <>{children}</> : <Outlet />;
};
