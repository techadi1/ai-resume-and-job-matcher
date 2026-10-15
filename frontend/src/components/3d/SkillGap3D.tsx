import React, { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FloatingParticles } from "./FloatingParticles";
import { SceneLoader } from "./SceneLoader";
import { ThreeDErrorBoundary } from "./3DErrorBoundary";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SkillGap3DProps {
  ownedSkills?: string[];
  missingSkills?: string[];
  heightClass?: string;
}

const DEFAULT_OWNED = ["Python", "React", "Node.js", "MongoDB", "SQL", "Git"];
const DEFAULT_MISSING = ["Docker", "AWS", "Kubernetes", "CI/CD"];

const ClusterNode: React.FC<{
  label: string;
  position: [number, number, number];
  isGap?: boolean;
}> = ({ label, position, isGap = false }) => {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const dy = Math.sin(t * 1.5 + position[0]) * 0.04;
    ref.current.position.y = position[1] + dy;

    const targetScale = hovered ? 1.25 : 1.0;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  const nodeColor = isGap ? (hovered ? "#F59E0B" : "#D97706") : (hovered ? "#14B8A6" : "#3B82F6");

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 0.7 : 0.25}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      <Html
        position={[0, 0.32, 0]}
        center
        distanceFactor={7}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border shadow-depth-1 ${
            hovered
              ? isGap
                ? "bg-amber-500 text-white border-amber-400 scale-105"
                : "bg-teal-500 text-white border-teal-300 scale-105"
              : isGap
              ? "bg-navy-900/95 text-amber-400 border-amber-500/50"
              : "bg-navy-900/95 text-slate-200 border-slate-700/80"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

export const SkillGap3D: React.FC<SkillGap3DProps> = ({
  ownedSkills = DEFAULT_OWNED,
  missingSkills = DEFAULT_MISSING,
  heightClass = "h-[400px]",
}) => {
  const activeOwned = ownedSkills.slice(0, 6);
  const activeMissing = missingSkills.slice(0, 5);

  // Position Owned Cluster on the Left
  const ownedNodes = useMemo(() => {
    return activeOwned.map((skill, idx) => {
      const angle = (idx / activeOwned.length) * Math.PI * 2;
      const x = -2.2 + Math.cos(angle) * 1.2;
      const y = Math.sin(angle) * 1.2;
      const z = Math.sin(angle * 3) * 0.2;
      return { skill, position: [x, y, z] as [number, number, number] };
    });
  }, [activeOwned]);

  // Position Missing Cluster on the Right
  const missingNodes = useMemo(() => {
    return activeMissing.map((skill, idx) => {
      const angle = (idx / activeMissing.length) * Math.PI * 2;
      const x = 2.2 + Math.cos(angle) * 1.2;
      const y = Math.sin(angle) * 1.2;
      const z = Math.sin(angle * 2) * 0.2;
      return { skill, position: [x, y, z] as [number, number, number] };
    });
  }, [activeMissing]);

  // Bridges connecting clusters
  const bridgeLines = useMemo(() => {
    const lines: Array<[THREE.Vector3, THREE.Vector3]> = [];
    if (ownedNodes.length > 0 && missingNodes.length > 0) {
      for (let i = 0; i < Math.min(ownedNodes.length, missingNodes.length); i++) {
        lines.push([
          new THREE.Vector3(...ownedNodes[i].position),
          new THREE.Vector3(...missingNodes[i].position),
        ]);
      }
    }
    return lines;
  }, [ownedNodes, missingNodes]);

  return (
    <ThreeDErrorBoundary title="Skill Gap Landscape" subtitle="Comparative competency cluster map">
      <div className={`relative w-full ${heightClass} rounded-2xl bg-navy-950 border border-slate-800/80 overflow-hidden shadow-depth-2`}>
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Top Header Labels */}
        <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Skill Differential Map
          </span>
        </div>

        {/* Left / Right Cluster Headers */}
        <div className="absolute top-10 left-6 z-10 pointer-events-none hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs font-bold text-electric">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile Strengths ({activeOwned.length})</span>
          </div>
        </div>
        <div className="absolute top-10 right-6 z-10 pointer-events-none hidden sm:block text-right">
          <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-400">
            <span>High-Priority Gaps ({activeMissing.length})</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        <Suspense fallback={<SceneLoader label="Projecting Skill Clusters..." />}>
          <Canvas
            camera={{ position: [0, 0, 6.8], fov: 46 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 5]} intensity={1.3} />
            <pointLight position={[-4, 0, 3]} intensity={0.5} color="#3B82F6" />
            <pointLight position={[4, 0, 3]} intensity={0.5} color="#F59E0B" />

            <FloatingParticles count={35} radius={4.5} />

            {/* Bridge Connection Lines */}
            {bridgeLines.map((pts, i) => (
              <primitive
                key={`bridge-${i}`}
                object={new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(pts),
                  new THREE.LineDashedMaterial({
                    color: "#475569",
                    dashSize: 0.15,
                    gapSize: 0.1,
                    transparent: true,
                    opacity: 0.35,
                  })
                )}
              />
            ))}

            {/* Left Cluster: Owned Skills */}
            {ownedNodes.map(({ skill, position }) => (
              <ClusterNode
                key={`owned-${skill}`}
                label={skill}
                position={position}
                isGap={false}
              />
            ))}

            {/* Right Cluster: Missing Skills */}
            {missingNodes.map(({ skill, position }) => (
              <ClusterNode
                key={`missing-${skill}`}
                label={skill}
                position={position}
                isGap={true}
              />
            ))}
          </Canvas>
        </Suspense>
      </div>
    </ThreeDErrorBoundary>
  );
};
