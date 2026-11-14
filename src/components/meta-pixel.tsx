"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { adoptBaseCode, initPixel, trackPixel, whenIdle } from "@/lib/pixel";

type TrackingConfig = { data: { enabled: boolean; pixel_ids: string[] } };

/**
 * The Meta base code is rendered in the page <head> (app/layout.tsx) and sends the first
 * PageView itself. This component sends a PageView on every later navigation inside the
 * site. If the base code is missing (pixel added in the admin since the page was built),
 * it loads the pixel IDs from the API once the page is idle.
 */
export function MetaPixel() {
  const [mode, setMode] = useState<"none" | "head" | "late">("none");

  useEffect(() => {
    if (adoptBaseCode()) {
      // Runs once after mount; the base code is already there.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("head");
      return;
    }
    return whenIdle(() => {
      apiFetch<TrackingConfig>("/tracking")
        .then((config) => {
          if (config.data.enabled && initPixel(config.data.pixel_ids)) setMode("late");
        })
        .catch((error: unknown) => console.warn("Meta Pixel configuration unavailable.", error));
    });
  }, []);

  if (mode === "none") return null;
  return (
    <Suspense fallback={null}>
      <PageViews skipFirst={mode === "head"} />
    </Suspense>
  );
}

function PageViews({ skipFirst }: { skipFirst: boolean }) {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    // The base code in <head> already counted the page the visitor landed on.
    if (first.current) {
      first.current = false;
      if (skipFirst) return;
    }
    trackPixel("PageView");
  }, [pathname, skipFirst]);
  return null;
}
