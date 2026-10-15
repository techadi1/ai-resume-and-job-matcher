import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Missing fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      success("Welcome back!", "Signed in successfully.");
      navigate(from, { replace: true });
    } catch (err: any) {
      let msg = err.response?.data?.message || err.response?.data?.detail;
      if (!msg) {
        if (!err.response || err.code === "ERR_NETWORK") {
          msg = "Unable to connect to server. Please verify the backend is running.";
        } else {
          msg = "Invalid email or password. Please try again.";
        }
      }
      error("Authentication Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your resume analysis, job matches, and skill pathways.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu or you@example.com"
              required
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Sign In
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Don't have an account yet?{" "}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition">
          Create an account
        </Link>
      </div>
    </Card>
  );
};
