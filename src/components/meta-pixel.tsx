"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { initPixel, trackPixel, whenIdle } from "@/lib/pixel";

type TrackingConfig = { data: { enabled: boolean; pixel_ids: string[] } };

/**
 * Loads the pixel IDs saved in the admin once the page is idle (so Meta's ~200 KB
 * script never delays the first paint) and sends a PageView on every navigation.
 * Events fired before that are queued, not lost.
 */
export function MetaPixel() {
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      whenIdle(() => {
        apiFetch<TrackingConfig>("/tracking")
          .then((config) => {
            if (config.data.enabled && initPixel(config.data.pixel_ids)) setReady(true);
          })
          .catch((error: unknown) => console.warn("Meta Pixel configuration unavailable.", error));
      }),
    [],
  );

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <PageViews />
    </Suspense>
  );
}

function PageViews() {
  const pathname = usePathname();
  useEffect(() => {
    trackPixel("PageView");
  }, [pathname]);
  return null;
}
