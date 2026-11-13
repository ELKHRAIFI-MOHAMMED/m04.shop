"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt with a moving highlight, in plain CSS variables (no
 * animation library). Mouse only; CSS disables it for reduced motion.
 */
export function Tilt({ children, className = "", max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.setProperty("--tilt-x", `${(-(y - 0.5) * max * 2).toFixed(2)}deg`);
      node.style.setProperty("--tilt-y", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
      node.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
      node.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
    });
  }

  function onPointerLeave() {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}
