import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Save,
  Briefcase,
  LogOut,
  Tag
} from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { profileService } from "../services/profileService";

export const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [careerInterestsText, setCareerInterestsText] = useState<string>("");
  const [skillsText, setSkillsText] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setEducation(user.education || "");
      setCareerInterestsText((user.careerInterests || []).join(", "));
      setSkillsText((user.skills || []).join(", "));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      error("Missing fields", "Name and email are required.");
      return;
    }

    setIsSaving(true);
    try {
      const interestsArray = careerInterestsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedUser = await profileService.updateProfile({
        name,
        email,
        phone,
        location,
        education,
        careerInterests: interestsArray,
        skills: skillsArray
      });

      setUser(updatedUser);
      success("Profile Updated", "Your changes have been saved.");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      error("Update Failed", msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your contact info, education, and career preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Account & Contact Information */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Personal & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Gupta"
                  required
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="aditya@example.com"
                  required
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Academic & Experience */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Education & Career Background
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Education / Degree
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech in Computer Science, IIT Delhi"
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Target Job Roles / Career Interests (comma separated)
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={careerInterestsText}
                onChange={(e) => setCareerInterestsText(e.target.value)}
                placeholder="Full Stack Developer, Software Engineer, Backend Engineer"
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Primary Technical Skills (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Python, React, Node.js, TypeScript, MongoDB, Git"
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Profile</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
