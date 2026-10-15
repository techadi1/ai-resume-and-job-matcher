import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneLoader } from "./SceneLoader";
import { ThreeDErrorBoundary } from "./3DErrorBoundary";

interface ResumeScore3DProps {
  score: number;
  label?: string;
  subtitle?: string;
  heightClass?: string;
}

const ScoreRingMesh: React.FC<{ score: number }> = ({ score }) => {
  const groupRef = useRef<THREE.Group>(null);
  const normalized = Math.min(Math.max(score, 0), 100);
  const arcLength = (normalized / 100) * (Math.PI * 2);

  // Score color gradient logic
  const ringColor = score >= 80 ? "#22C55E" : score >= 65 ? "#3B82F6" : "#F59E0B";

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    groupRef.current.rotation.x = Math.sin(t * 0.7) * 0.08;
    groupRef.current.rotation.y = Math.cos(t * 0.6) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {/* Background Track Ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#1E293B"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Active Score Arc */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.5, 0.12, 16, 64, arcLength]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Decorative Outer Thin Wire Ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.8, 0.015, 16, 64]} />
        <meshBasicMaterial
          color="#334155"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Center Score Readout via HTML for Crisp Typography */}
      <Html center distanceFactor={5.5} style={{ pointerEvents: "none" }}>
        <div className="text-center select-none">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-black text-white tracking-tight">
              {score}
            </span>
            <span className="text-sm font-semibold text-slate-400 ml-1">/100</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mt-1">
            Resume Score
          </span>
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
              score >= 80
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : score >= 65
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {score >= 80 ? "Competitive ATS" : score >= 65 ? "Solid Foundation" : "Needs Expansion"}
          </span>
        </div>
      </Html>
    </group>
  );
};

export const ResumeScore3D: React.FC<ResumeScore3DProps> = ({
  score,
  label = "ATS Resume Score",
  subtitle = "Evaluated against 100+ industry criteria",
  heightClass = "h-[280px]",
}) => {
  return (
    <ThreeDErrorBoundary
      fallback={
        <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 bg-navy-950 rounded-2xl border border-slate-800 text-center">
          <span className="text-4xl font-black text-white">{score}/100</span>
          <span className="text-xs text-slate-400 mt-1 uppercase font-semibold">{label}</span>
        </div>
      }
    >
      <div className={`relative w-full ${heightClass} rounded-2xl bg-navy-950 border border-slate-800/80 overflow-hidden shadow-depth-2 flex flex-col items-center justify-center`}>
        {/* Subtle radial glow behind ring */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at center, #3B82F6 0%, transparent 60%)`,
          }}
        />

        <div className="absolute top-3 left-4 z-10 pointer-events-none">
          <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase block">
            {label}
          </span>
          <span className="text-[11px] text-slate-500">{subtitle}</span>
        </div>

        <Suspense fallback={<SceneLoader label="Calibrating Score Visualizer..." />}>
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[3, 5, 4]} intensity={1.5} />
            <pointLight position={[-3, -3, 2]} intensity={0.5} color="#3B82F6" />

            <ScoreRingMesh score={score} />
          </Canvas>
        </Suspense>
      </div>
    </ThreeDErrorBoundary>
  );
};
