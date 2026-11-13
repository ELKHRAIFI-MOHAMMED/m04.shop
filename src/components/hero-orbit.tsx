"use client";

import dynamic from "next/dynamic";
import { useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

const OrbitScene = dynamic(() => import("@/components/orbit-scene"), {
  ssr: false,
  loading: () => <div className="orbit-fallback" aria-hidden="true"><span>4</span></div>,
});

/** Lazy-loaded 3D brand mark. Rendering pauses when the hero leaves the viewport. */
export function HeroOrbit({ progress }: { progress: MotionValue<number> }) {
  const still = useReducedMotion() ?? false;
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="orbit-frame" aria-hidden="true">
      <OrbitScene progress={progress} still={still} active={active} />
    </div>
  );
}
