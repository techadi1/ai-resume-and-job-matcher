import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface SkillNodeProps {
  label: string;
  category?: string;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  color?: string;
  glowColor?: string;
  isGap?: boolean;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  label,
  category = "Technical Skill",
  position,
  targetPosition = [0, 0, 0],
  color = "#3B82F6",
  glowColor = "#14B8A6",
  isGap = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Line points connecting this skill to target (resume center)
  const linePoints = useMemo(() => {
    return [
      new THREE.Vector3(...position),
      new THREE.Vector3(...targetPosition),
    ];
  }, [position, targetPosition]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(linePoints);
  }, [linePoints]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle unique oscillation per skill based on position seed
    const offset = position[0] * 1.5 + position[1] * 1.2;
    const dy = Math.sin(t * 1.5 + offset) * 0.04;
    groupRef.current.position.y = position[1] + dy;

    // Smooth hover scale
    const targetScale = hovered ? 1.25 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  return (
    <>
      {/* Subtle Connection Line */}
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: hovered ? (isGap ? "#F59E0B" : glowColor) : (isGap ? "#78350F" : "#1E293B"),
          transparent: true,
          opacity: hovered ? 0.8 : (isGap ? 0.35 : 0.25),
        })
      )} />

      {/* 3D Skill Node Geometry */}
      <group
        ref={groupRef}
        position={[position[0], position[1], position[2]]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {/* Core Node Mesh */}
        <mesh castShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            color={isGap ? (hovered ? "#F59E0B" : "#D97706") : (hovered ? glowColor : color)}
            emissive={isGap ? "#B45309" : (hovered ? color : "#0B1220")}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Outer Glow Halo (subtle on hover) */}
        {hovered && (
          <mesh scale={[1.4, 1.4, 1.4]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial
              color={isGap ? "#F59E0B" : glowColor}
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        )}

        {/* Clean DOM Label Pill */}
        <Html
          position={[0, 0.28, 0]}
          center
          distanceFactor={7}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border shadow-depth-1 ${
              hovered
                ? isGap
                  ? "bg-amber-500 text-white border-amber-400 scale-110 shadow-depth-2"
                  : "bg-electric text-white border-electric-light scale-110 shadow-depth-2"
                : isGap
                ? "bg-navy-900/90 text-amber-400 border-amber-500/40"
                : "bg-navy-900/90 text-slate-200 border-slate-700/80"
            }`}
          >
            {label}
          </div>
        </Html>

        {/* Extended Tooltip on Hover */}
        {hovered && (
          <Html
            position={[0, -0.32, 0]}
            center
            distanceFactor={7}
            style={{ pointerEvents: "none" }}
          >
            <div className="px-2.5 py-1 rounded-md bg-navy-950/95 border border-slate-700 text-center whitespace-nowrap shadow-depth-3 backdrop-blur-md">
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isGap ? "text-amber-400" : "text-tealAccent"
              }`}>
                {isGap ? "Identified Skill Gap" : "Core Competency"}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {category}
              </span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};
