import React, { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { SkillNode } from "./SkillNode";
import { FloatingParticles } from "./FloatingParticles";
import { SceneLoader } from "./SceneLoader";
import { ThreeDErrorBoundary } from "./3DErrorBoundary";

interface SkillNetwork3DProps {
  skills?: string[];
  missingSkills?: string[];
  withCanvas?: boolean;
  heightClass?: string;
  targetPosition?: [number, number, number];
}

const DEFAULT_SKILLS = ["Python", "React", "Node.js", "MongoDB", "Docker", "AWS"];

export const SkillNetworkContent: React.FC<{
  skills?: string[];
  missingSkills?: string[];
  targetPosition?: [number, number, number];
}> = ({
  skills = DEFAULT_SKILLS,
  missingSkills = [],
  targetPosition = [0, 0, 0],
}) => {
  // Compute positions arranged in a balanced orbit
  const activeNodes = useMemo(() => {
    const list = skills.slice(0, 8);
    const total = list.length;
    return list.map((skill, index) => {
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      const radiusX = 2.4;
      const radiusY = 1.6;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const z = (Math.sin(angle * 2) * 0.3);

      return {
        label: skill,
        category: "Technical Skill",
        position: [x, y, z] as [number, number, number],
        isGap: false,
      };
    });
  }, [skills]);

  const gapNodes = useMemo(() => {
    const list = missingSkills.slice(0, 4);
    const total = list.length;
    return list.map((skill, index) => {
      // Outer ring for skill gaps
      const angle = (index / Math.max(total, 1)) * Math.PI + Math.PI / 4;
      const radiusX = 3.2;
      const radiusY = 2.2;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const z = -0.4;

      return {
        label: skill,
        category: "Recommended Gap",
        position: [x, y, z] as [number, number, number],
        isGap: true,
      };
    });
  }, [missingSkills]);

  return (
    <group>
      {activeNodes.map((node) => (
        <SkillNode
          key={`skill-${node.label}`}
          label={node.label}
          category={node.category}
          position={node.position}
          targetPosition={targetPosition}
          color="#3B82F6"
          glowColor="#14B8A6"
          isGap={false}
        />
      ))}
      {gapNodes.map((node) => (
        <SkillNode
          key={`gap-${node.label}`}
          label={node.label}
          category={node.category}
          position={node.position}
          targetPosition={targetPosition}
          color="#F59E0B"
          glowColor="#D97706"
          isGap={true}
        />
      ))}
    </group>
  );
};

export const SkillNetwork3D: React.FC<SkillNetwork3DProps> = ({
  skills = DEFAULT_SKILLS,
  missingSkills = [],
  withCanvas = true,
  heightClass = "h-[360px]",
  targetPosition = [0, 0, 0],
}) => {
  if (!withCanvas) {
    return (
      <SkillNetworkContent
        skills={skills}
        missingSkills={missingSkills}
        targetPosition={targetPosition}
      />
    );
  }

  return (
    <ThreeDErrorBoundary title="Skill Ecosystem" subtitle="Interactive 3D competency graph">
      <div className={`relative w-full ${heightClass} rounded-2xl bg-navy-950 border border-slate-800/80 overflow-hidden shadow-depth-2`}>
        {/* Subtle technical background grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Ambient Top Overlay Header */}
        <div className="absolute top-3.5 left-4 z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tealAccent animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              Competency Network
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Hover nodes to inspect relationship weights
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-3 text-[11px] pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-electric" />
            <span className="text-slate-400">Verified Skills</span>
          </div>
          {missingSkills.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-400">Identified Gaps</span>
            </div>
          )}
        </div>

        <Suspense fallback={<SceneLoader label="Rendering Skill Graph..." />}>
          <Canvas
            camera={{ position: [0, 0, 6.2], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} />
            <pointLight position={[-5, -5, 2]} intensity={0.4} color="#14B8A6" />

            <FloatingParticles count={40} radius={4} />
            <SkillNetworkContent
              skills={skills}
              missingSkills={missingSkills}
              targetPosition={targetPosition}
            />
          </Canvas>
        </Suspense>
      </div>
    </ThreeDErrorBoundary>
  );
};
