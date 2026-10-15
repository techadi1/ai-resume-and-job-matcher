import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FloatingParticles } from "./FloatingParticles";
import { SceneLoader } from "./SceneLoader";
import { ThreeDErrorBoundary } from "./3DErrorBoundary";
import { TrendingUp } from "lucide-react";

export interface CareerMilestone {
  step: number;
  phase: string;
  title: string;
  skills: string[];
  status: "completed" | "current" | "recommended" | "goal";
}

interface CareerPath3DProps {
  milestones?: CareerMilestone[];
  heightClass?: string;
}

const DEFAULT_MILESTONES: CareerMilestone[] = [
  {
    step: 1,
    phase: "Current Core",
    title: "Full Stack Foundations",
    skills: ["Python", "React", "Node.js", "SQL"],
    status: "completed",
  },
  {
    step: 2,
    phase: "Skill Augmentation",
    title: "Container & Cloud Tooling",
    skills: ["Docker", "AWS", "CI/CD"],
    status: "current",
  },
  {
    step: 3,
    phase: "Target Profile",
    title: "Senior Full Stack Engineer",
    skills: ["Microservices", "Redis", "Distributed Systems"],
    status: "recommended",
  },
  {
    step: 4,
    phase: "Strategic Horizon",
    title: "Lead Platform Architect",
    skills: ["System Design", "Cloud Architecture"],
    status: "goal",
  },
];

const MilestoneNode: React.FC<{
  item: CareerMilestone;
  xPosition: number;
}> = ({ item, xPosition }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const dy = Math.sin(t * 1.5 + xPosition) * 0.05;
    groupRef.current.position.y = dy;

    const targetScale = hovered ? 1.2 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  const nodeColor =
    item.status === "completed"
      ? "#22C55E"
      : item.status === "current"
      ? "#3B82F6"
      : item.status === "recommended"
      ? "#14B8A6"
      : "#94A3B8";

  return (
    <group
      ref={groupRef}
      position={[xPosition, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Milestone Core Geometry */}
      <mesh castShadow>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color={hovered ? "#FFFFFF" : nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* HTML Detail Card */}
      <Html
        position={[0, 0.45, 0]}
        center
        distanceFactor={6.8}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`w-36 p-2 rounded-xl text-center border shadow-depth-2 backdrop-blur-md transition-all duration-200 ${
            hovered
              ? "bg-navy-900 border-electric-light scale-105"
              : "bg-navy-950/90 border-slate-700/80"
          }`}
        >
          <span
            className={`text-[9px] font-bold uppercase tracking-wider block ${
              item.status === "completed"
                ? "text-emerald-400"
                : item.status === "current"
                ? "text-blue-400"
                : item.status === "recommended"
                ? "text-tealAccent"
                : "text-slate-400"
            }`}
          >
            {item.phase}
          </span>
          <h5 className="text-[11px] font-bold text-white leading-tight mt-0.5">
            {item.title}
          </h5>
          <div className="flex flex-wrap gap-1 justify-center mt-1.5">
            {item.skills.slice(0, 2).map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
};

export const CareerPath3D: React.FC<CareerPath3DProps> = ({
  milestones = DEFAULT_MILESTONES,
  heightClass = "h-[360px]",
}) => {
  // Horizontal coordinates for milestones
  const milestoneCoords = useMemo(() => {
    const count = milestones.length;
    return milestones.map((item, idx) => {
      // span from -2.7 to +2.7
      const x = -2.7 + (idx / Math.max(count - 1, 1)) * 5.4;
      return { item, x };
    });
  }, [milestones]);

  const pipelineGeometry = useMemo(() => {
    if (milestoneCoords.length < 2) return null;
    const points = milestoneCoords.map((m) => new THREE.Vector3(m.x, 0, 0));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [milestoneCoords]);

  return (
    <ThreeDErrorBoundary title="Career Progression Vector" subtitle="Directional competency trajectory">
      <div className={`relative w-full ${heightClass} rounded-2xl bg-navy-950 border border-slate-800/80 overflow-hidden shadow-depth-2`}>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Top Header */}
        <div className="absolute top-3.5 left-4 z-10 pointer-events-none flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-tealAccent" />
          <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Trajectory Modeling
          </span>
        </div>

        {/* Responsible AI Disclaimer */}
        <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none flex justify-between items-center text-[10px] text-slate-500">
          <span>Directional career models derived from skill adjacencies.</span>
          <span>Hover milestones to inspect target stacks</span>
        </div>

        <Suspense fallback={<SceneLoader label="Mapping Career Vector..." />}>
          <Canvas
            camera={{ position: [0, 0, 5.8], fov: 46 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 4]} intensity={1.3} />
            <pointLight position={[0, -2, 2]} intensity={0.6} color="#14B8A6" />

            <FloatingParticles count={30} radius={4} />

            {/* Connecting Pipeline Beam */}
            {pipelineGeometry && (
              <primitive
                object={new THREE.Line(
                  pipelineGeometry,
                  new THREE.LineBasicMaterial({
                    color: "#3B82F6",
                    transparent: true,
                    opacity: 0.45,
                    linewidth: 2,
                  })
                )}
              />
            )}

            {/* Milestone Nodes */}
            {milestoneCoords.map(({ item, x }) => (
              <MilestoneNode key={`ms-${item.step}`} item={item} xPosition={x} />
            ))}
          </Canvas>
        </Suspense>
      </div>
    </ThreeDErrorBoundary>
  );
};
