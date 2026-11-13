"use client";

import { useEffect } from "react";
import { whenIdle } from "@/lib/pixel";

/**
 * Inertial scrolling for mouse/trackpad users only, loaded after the page is idle so
 * it never weighs on the first paint. Phones keep native scrolling, and visitors who
 * ask for reduced motion keep it too.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let lenis: { destroy: () => void } | null = null;
    let stopped = false;
    const cancel = whenIdle(() => {
      void import("lenis").then(({ default: Lenis }) => {
        if (stopped) return;
        lenis = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -96 } });
      });
    });
    return () => {
      stopped = true;
      cancel();
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
