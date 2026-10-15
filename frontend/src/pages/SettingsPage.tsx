import React, { useState } from "react";
import { Bell, Palette, Save } from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useToast } from "../context/ToastContext";

export const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    jobAlerts: true,
    weeklyDigest: false,
    matchUpdates: true,
  });

  const [appearance, setAppearance] = useState({
    compactMode: false,
    autoAnalyze: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const { success } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsSaving(false);
    success("Settings Saved", "Your preferences have been updated.");
  };

  const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 focus:outline-none cursor-pointer ${
        checked ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-150 ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your notification preferences, display options, and analysis settings.
        </p>
      </div>

      {/* Notifications */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
            <p className="text-xs text-slate-500">Configure email alerts and analysis updates</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "emailAlerts",
              label: "Email Notifications",
              desc: "Receive analysis receipts and account security notices",
            },
            {
              key: "jobAlerts",
              label: "New Job Match Alerts",
              desc: "Get notified when high-matching jobs (80%+) are available",
            },
            {
              key: "matchUpdates",
              label: "Score Recalculation Updates",
              desc: "Alerts when re-running ML scoring on updated resumes",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1.5">
              <div className="flex-1 mr-4">
                <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <Toggle
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof notifications],
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Palette className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Application Preferences</h3>
            <p className="text-xs text-slate-500">Display density and analysis behaviors</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-1.5">
            <div className="flex-1 mr-4">
              <p className="text-xs font-semibold text-slate-800">Compact Table Density</p>
              <p className="text-xs text-slate-500">Show tighter row spacing in history tables</p>
            </div>
            <Toggle
              checked={appearance.compactMode}
              onChange={() =>
                setAppearance((prev) => ({ ...prev, compactMode: !prev.compactMode }))
              }
            />
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div className="flex-1 mr-4">
              <p className="text-xs font-semibold text-slate-800">Automatic Job Matching</p>
              <p className="text-xs text-slate-500">Trigger vector matching automatically upon upload</p>
            </div>
            <Toggle
              checked={appearance.autoAnalyze}
              onChange={() =>
                setAppearance((prev) => ({ ...prev, autoAnalyze: !prev.autoAnalyze }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          isLoading={isSaving}
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-1.5" />
          <span>Save Preferences</span>
        </Button>
      </div>
    </div>
  );
};
