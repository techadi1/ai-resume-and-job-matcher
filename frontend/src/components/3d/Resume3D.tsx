import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface Resume3DProps {
  score?: number;
  candidateName?: string;
  targetRole?: string;
  onHover?: (hovered: boolean) => void;
}

export const Resume3D: React.FC<Resume3DProps> = ({
  score = 84,
  candidateName = "Aditya Gupta",
  targetRole = "Software Engineer",
  onHover,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Gentle ambient floating motion
    const t = state.clock.getElapsedTime();
    const targetY = Math.sin(t * 1.2) * 0.08;
    const targetRotX = Math.sin(t * 0.8) * 0.04 - (hovered ? 0.05 : 0);
    const targetRotY = Math.cos(t * 0.9) * 0.06 + (hovered ? 0.12 : 0);
    const targetScale = hovered ? 1.05 : 1.0;
    const targetZ = hovered ? 0.25 : 0;

    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 4);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 4);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, delta * 4);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, delta * 4);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(false);
  };

  return (
    <group
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      position={[0, 0, 0]}
    >
      {/* Document Board Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 3.1, 0.04]} />
        <meshStandardMaterial
          color={hovered ? "#16233B" : "#111A2B"}
          roughness={0.25}
          metalness={0.15}
          emissive={hovered ? "#1E2F4D" : "#0B1220"}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Subtle Document Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.2, 3.1, 0.04)]} />
        <lineBasicMaterial
          color={hovered ? "#3B82F6" : "#2A3C5B"}
          linewidth={1}
          transparent
          opacity={hovered ? 0.8 : 0.4}
        />
      </lineSegments>

      {/* Abstract Document Header Lines */}
      {/* Photo/Avatar Block */}
      <mesh position={[-0.7, 1.15, 0.025]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.85} />
      </mesh>

      {/* Name line */}
      <mesh position={[-0.05, 1.25, 0.025]}>
        <planeGeometry args={[0.8, 0.08]} />
        <meshBasicMaterial color="#E2E8F0" transparent opacity={0.9} />
      </mesh>

      {/* Role line */}
      <mesh position={[-0.15, 1.1, 0.025]}>
        <planeGeometry args={[0.6, 0.05]} />
        <meshBasicMaterial color="#94A3B8" transparent opacity={0.7} />
      </mesh>

      {/* Header divider */}
      <mesh position={[0, 0.85, 0.025]}>
        <planeGeometry args={[1.8, 0.015]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.6} />
      </mesh>

      {/* Section 1: Summary lines */}
      <mesh position={[-0.1, 0.65, 0.025]}>
        <planeGeometry args={[1.6, 0.04]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.2, 0.52, 0.025]}>
        <planeGeometry args={[1.4, 0.04]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.5} />
      </mesh>

      {/* Section 2: Technical Skills Grid */}
      <mesh position={[-0.5, 0.3, 0.025]}>
        <planeGeometry args={[0.7, 0.05]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.75} />
      </mesh>
      {/* Skill pill representations */}
      <mesh position={[-0.5, 0.12, 0.025]}>
        <planeGeometry args={[0.3, 0.07]} />
        <meshBasicMaterial color="#1E3A8A" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.15, 0.12, 0.025]}>
        <planeGeometry args={[0.32, 0.07]} />
        <meshBasicMaterial color="#1E3A8A" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.22, 0.12, 0.025]}>
        <planeGeometry args={[0.35, 0.07]} />
        <meshBasicMaterial color="#1E3A8A" transparent opacity={0.8} />
      </mesh>

      {/* Section 3: Experience Lines */}
      <mesh position={[-0.45, -0.15, 0.025]}>
        <planeGeometry args={[0.8, 0.05]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.75} />
      </mesh>
      <mesh position={[-0.05, -0.32, 0.025]}>
        <planeGeometry args={[1.6, 0.035]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.15, -0.44, 0.025]}>
        <planeGeometry args={[1.4, 0.035]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.25, -0.56, 0.025]}>
        <planeGeometry args={[1.2, 0.035]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.3} />
      </mesh>

      {/* Section 4: Projects & Education */}
      <mesh position={[-0.5, -0.8, 0.025]}>
        <planeGeometry args={[0.7, 0.045]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.75} />
      </mesh>
      <mesh position={[-0.1, -0.96, 0.025]}>
        <planeGeometry args={[1.5, 0.035]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.45} />
      </mesh>
      <mesh position={[-0.2, -1.08, 0.025]}>
        <planeGeometry args={[1.3, 0.035]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.35} />
      </mesh>

      {/* Document Floating Score Badge */}
      <Html
        position={[0.75, 1.25, 0.08]}
        center
        distanceFactor={6}
        style={{ pointerEvents: "none" }}
      >
        <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg bg-navy-900/90 border border-electric/40 shadow-glow-blue backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Score</span>
          <span className="text-base font-black text-electric tracking-tight">{score}</span>
        </div>
      </Html>

      {/* Hover Info Tooltip */}
      {hovered && (
        <Html
          position={[0, -1.75, 0.1]}
          center
          distanceFactor={6}
          style={{ pointerEvents: "none" }}
        >
          <div className="px-3 py-1.5 rounded-lg bg-navy-900/95 border border-slate-700/80 shadow-depth-2 text-center whitespace-nowrap backdrop-blur-md">
            <p className="text-xs font-semibold text-white">{candidateName}</p>
            <p className="text-[11px] text-tealAccent">{targetRole}</p>
          </div>
        </Html>
      )}
    </group>
  );
};
