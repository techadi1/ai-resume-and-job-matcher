import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Resume3D } from "./Resume3D";
import { SkillNetworkContent } from "./SkillNetwork3D";
import { FloatingParticles } from "./FloatingParticles";
import { SceneLoader } from "./SceneLoader";
import { ThreeDErrorBoundary } from "./3DErrorBoundary";
import { WebGLFallback } from "./WebGLFallback";
import { Sparkles, Briefcase } from "lucide-react";

interface HeroSceneProps {
  score?: number;
  matchRate?: number;
  candidateName?: string;
  targetRole?: string;
  skills?: string[];
}

const InteractiveCameraRig: React.FC = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      // Normalize mouse to [-1, 1]
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    // Subtle 2-4 degree camera parallax
    const targetX = mouse.current.x * 0.45;
    const targetY = -mouse.current.y * 0.35;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 2.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 2.5);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export const HeroScene: React.FC<HeroSceneProps> = ({
  score = 88,
  matchRate = 92,
  candidateName = "Alex Morgan",
  targetRole = "Senior Software Engineer",
  skills = ["Python", "React", "Node.js", "MongoDB", "Docker", "AWS"],
}) => {
  return (
    <ThreeDErrorBoundary
      fallback={
        <WebGLFallback
          title="Career Intelligence Model"
          subtitle="Interactive 3D view substituted with high-fidelity visual rendering"
          score={score}
          skills={skills}
          matchedRole={targetRole}
          matchPercentage={matchRate}
        />
      }
    >
      <div className="relative w-full h-[480px] lg:h-[540px] rounded-2xl bg-navy-950 border border-slate-800/80 shadow-depth-3 overflow-hidden select-none">
        {/* Subtle technical background grid */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
            backgroundSize: "28px 28px"
          }}
        />

        {/* Ambient Top Left Indicator */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric animate-ping" />
          <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase">
            3D Knowledge Canvas
          </span>
        </div>

        {/* Top-Right Score Badge Overlay (Desktop & Mobile) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="px-3.5 py-2 rounded-xl bg-navy-900/90 border border-slate-700/80 shadow-depth-2 backdrop-blur-md flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Resume Score
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                {score}<span className="text-xs font-medium text-slate-400">/100</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-electric/15 border border-electric/30 flex items-center justify-center text-electric">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Bottom-Left Job Match Badge Overlay */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="px-3.5 py-2 rounded-xl bg-navy-900/90 border border-slate-700/80 shadow-depth-2 backdrop-blur-md flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tealAccent/15 border border-tealAccent/30 flex items-center justify-center text-tealAccent">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{targetRole}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-tealAccent/20 text-tealAccent">
                  {matchRate}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Target Role Match</span>
            </div>
          </div>
        </div>

        {/* Subtle Canvas Interaction Tip */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:block">
          <span className="text-[10px] text-slate-500 bg-navy-900/60 px-2 py-1 rounded border border-slate-800">
            Interactive · Move mouse to tilt
          </span>
        </div>

        {/* 3D Canvas */}
        <Suspense fallback={<SceneLoader label="Initializing 3D Workspace..." />}>
          <Canvas
            camera={{ position: [0, 0, 5.6], fov: 46 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            {/* Professional studio lighting setup */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 7, 5]} intensity={1.4} color="#FFFFFF" castShadow />
            <directionalLight position={[-5, -3, 3]} intensity={0.5} color="#3B82F6" />
            <pointLight position={[0, -2, 2]} intensity={0.6} color="#14B8A6" />

            {/* Camera Mouse Tilt Controller */}
            <InteractiveCameraRig />

            {/* Subtle technical particle field */}
            <FloatingParticles count={50} radius={4.5} />

            {/* 3D Digital Resume */}
            <Resume3D
              score={score}
              candidateName={candidateName}
              targetRole={targetRole}
            />

            {/* Orbiting 3D Skill Network */}
            <SkillNetworkContent
              skills={skills}
              targetPosition={[0, 0, 0]}
            />
          </Canvas>
        </Suspense>
      </div>
    </ThreeDErrorBoundary>
  );
};
