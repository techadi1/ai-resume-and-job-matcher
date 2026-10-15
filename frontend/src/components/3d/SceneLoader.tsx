import React from "react";
import { Loader2 } from "lucide-react";

export const SceneLoader: React.FC<{ label?: string }> = ({ label = "Loading 3D Environment..." }) => {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-navy-950/80 rounded-2xl border border-slate-800/80 p-6 text-slate-400">
      <Loader2 className="w-7 h-7 text-electric animate-spin mb-3" />
      <span className="text-xs font-medium tracking-wide uppercase text-slate-400">{label}</span>
      <span className="text-[11px] text-slate-500 mt-1">Initializing WebGL rendering context</span>
    </div>
  );
};
