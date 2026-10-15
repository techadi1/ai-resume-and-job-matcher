import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "../components/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 border border-slate-200 mb-4">
          <SearchX className="w-7 h-7 text-slate-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-1">404</h1>
        <h2 className="text-base font-semibold text-slate-800 mb-2">Page not found</h2>
        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
          The requested page could not be located or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link to="/">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
