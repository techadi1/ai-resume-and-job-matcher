import React from "react";
import { SkillBadge } from "./SkillBadge";

interface SkillCloudProps {
  skills: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  emptyMessage?: string;
}

export const SkillCloud: React.FC<SkillCloudProps> = ({
  skills,
  matchedSkills = [],
  missingSkills = [],
  emptyMessage = "No skills detected yet.",
}) => {
  if (!skills || skills.length === 0) {
    return <p className="text-xs text-slate-400 italic">{emptyMessage}</p>;
  }

  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));
  const missingSet = new Set(missingSkills.map((s) => s.toLowerCase()));

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => {
        const skillLower = skill.toLowerCase();
        const isMatched = matchedSet.has(skillLower);
        const isMissing = missingSet.has(skillLower);

        return (
          <SkillBadge
            key={`${skill}-${idx}`}
            name={skill}
            isMatched={isMatched}
            isMissing={isMissing}
          />
        );
      })}
    </div>
  );
};
