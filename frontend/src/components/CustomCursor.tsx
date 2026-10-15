import React, { useEffect, useState } from "react";

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hoverType, setHoverType] = useState<"default" | "interactive" | "canvas">("default");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices without reduced-motion preference
    if (typeof window === "undefined") return;
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isPointerFine || prefersReducedMotion || window.innerWidth < 768) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.tagName === "CANVAS" || target.closest("canvas")) {
        setHoverType("canvas");
      } else if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button"
      ) {
        setHoverType("interactive");
      } else {
        setHoverType("default");
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Precision Inner Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        }}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            hoverType === "canvas"
              ? "bg-tealAccent"
              : hoverType === "interactive"
              ? "bg-electric"
              : "bg-slate-400"
          }`}
        />
      </div>

      {/* Subtle Responsive Tracking Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(${pos.x - 12}px, ${pos.y - 12}px, 0)`,
        }}
      >
        <div
          className={`w-6 h-6 rounded-full border transition-all duration-200 ${
            hoverType === "canvas"
              ? "scale-150 border-tealAccent/60 bg-tealAccent/10"
              : hoverType === "interactive"
              ? "scale-125 border-electric/60 bg-electric/10"
              : "scale-100 border-slate-400/30"
          }`}
        />
      </div>
    </>
  );
};
