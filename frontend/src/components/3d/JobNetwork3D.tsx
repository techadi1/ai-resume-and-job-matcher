import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FloatingParticles } from "./FloatingParticles";
import { SceneLoader } from "./SceneLoader";
import { ThreeDErrorBoundary } from "./3DErrorBoundary";

export interface JobNetworkNode {
  id?: string;
  title: string;
  company?: string;
  matchPercentage: number;
  location?: string;
}

interface JobNetwork3DProps {
  jobs?: JobNetworkNode[];
  onSelectJob?: (jobId: string) => void;
  heightClass?: string;
}

const DEFAULT_JOBS: JobNetworkNode[] = [
  { id: "1", title: "Software Engineer", company: "Microsoft", matchPercentage: 87, location: "Noida, India" },
  { id: "2", title: "Backend Engineer", company: "Razorpay", matchPercentage: 84, location: "Bengaluru, India" },
  { id: "3", title: "Full Stack Developer", company: "Flipkart", matchPercentage: 81, location: "Bengaluru, India" },
  { id: "4", title: "Data Scientist", company: "Zomato", matchPercentage: 74, location: "Gurugram, India" },
  { id: "5", title: "Cloud Solutions Eng.", company: "Amazon AWS", matchPercentage: 79, location: "Hyderabad, India" },
];

const JobNode: React.FC<{
  job: JobNetworkNode;
  position: [number, number, number];
  onSelect?: () => void;
}> = ({ job, position, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Line from center [0,0,0] to this node
  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(...position),
    ]);
  }, [position]);

  const lineColor = useMemo(() => {
    if (job.matchPercentage >= 85) return "#22C55E"; // Green high match
    if (job.matchPercentage >= 75) return "#3B82F6"; // Electric blue
    return "#64748B"; // Slate
  }, [job.matchPercentage]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const dy = Math.sin(t * 1.4 + position[0]) * 0.05;
    meshRef.current.position.y = position[1] + dy;

    const targetScale = hovered ? 1.25 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  return (
    <>
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: hovered ? "#38BDF8" : lineColor,
          transparent: true,
          opacity: hovered ? 0.9 : 0.35,
          linewidth: hovered ? 2 : 1,
        })
      )} />

      <group
        ref={meshRef}
        position={[position[0], position[1], position[2]]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {/* Node Mesh */}
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial
            color={hovered ? "#38BDF8" : lineColor}
            emissive={hovered ? lineColor : "#0B1220"}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* DOM HTML Label */}
        <Html
          position={[0, 0.36, 0]}
          center
          distanceFactor={7}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border shadow-depth-2 cursor-pointer ${
              hovered
                ? "bg-electric text-white border-electric-light scale-105"
                : "bg-navy-900/90 text-slate-200 border-slate-700/80"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>{job.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                job.matchPercentage >= 85
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-blue-500/20 text-blue-300"
              }`}>
                {job.matchPercentage}%
              </span>
            </div>
            {job.company && (
              <p className="text-[10px] text-slate-400 font-normal">{job.company}</p>
            )}
          </div>
        </Html>
      </group>
    </>
  );
};

export const JobNetwork3D: React.FC<JobNetwork3DProps> = ({
  jobs = DEFAULT_JOBS,
  onSelectJob,
  heightClass = "h-[380px]",
}) => {
  const activeJobs = jobs.length > 0 ? jobs.slice(0, 6) : DEFAULT_JOBS;

  // Compute radial layout coordinates around center
  const nodes = useMemo(() => {
    const total = activeJobs.length;
    return activeJobs.map((job, idx) => {
      const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
      const radiusX = 2.8;
      const radiusY = 1.7;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const z = Math.sin(angle * 2) * 0.2;

      return {
        job,
        position: [x, y, z] as [number, number, number],
      };
    });
  }, [activeJobs]);

  return (
    <ThreeDErrorBoundary title="Job Compatibility Network" subtitle="3D graph of matching opportunities">
      <div className={`relative w-full ${heightClass} rounded-2xl bg-navy-950 border border-slate-800/80 overflow-hidden shadow-depth-2`}>
        {/* Subtle technical background grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Header Overlay */}
        <div className="absolute top-3.5 left-4 z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              Opportunity Network Map
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Radial proximity weighted by compatibility algorithm
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-3 text-[11px] pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">&gt;85% High Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-electric" />
            <span className="text-slate-400">75-84% Moderate</span>
          </div>
        </div>

        <Suspense fallback={<SceneLoader label="Computing Compatibility Vectors..." />}>
          <Canvas
            camera={{ position: [0, 0, 6.2], fov: 46 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} />
            <pointLight position={[-4, -3, 2]} intensity={0.5} color="#3B82F6" />

            <FloatingParticles count={35} radius={4} />

            {/* Central Resume Node */}
            <group position={[0, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 0.12, 32]} />
                <meshStandardMaterial
                  color="#111A2B"
                  emissive="#1E3A8A"
                  emissiveIntensity={0.4}
                  roughness={0.2}
                />
              </mesh>
              <lineSegments>
                <edgesGeometry args={[new THREE.CylinderGeometry(0.5, 0.5, 0.12, 32)]} />
                <lineBasicMaterial color="#3B82F6" transparent opacity={0.7} />
              </lineSegments>
              <Html center distanceFactor={7} style={{ pointerEvents: "none" }}>
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-electric block">
                    Profile
                  </span>
                  <span className="text-xs font-bold text-white whitespace-nowrap">Your Resume</span>
                </div>
              </Html>
            </group>

            {/* Orbiting Job Nodes */}
            {nodes.map(({ job, position }) => (
              <JobNode
                key={job.id || job.title}
                job={job}
                position={position}
                onSelect={() => job.id && onSelectJob?.(job.id)}
              />
            ))}
          </Canvas>
        </Suspense>
      </div>
    </ThreeDErrorBoundary>
  );
};
