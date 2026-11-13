"use client";

import Link from "next/link";
import { useRef } from "react";
import { useScroll } from "motion/react";
import { HeroOrbit } from "@/components/hero-orbit";
import { useStore } from "@/lib/storefront";

/** Shown when no slide is configured: the 3D brand mark. */
export default function BrandFallback() {
  const { t } = useStore();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  return (
    <section className="hero" ref={ref}>
      <div className="page-wrap hero-layout">
        <div className="hero-copy">
          <h1 className="hero-title">{t("heroTitle")}</h1>
          <p className="hero-description">{t("heroText")}</p>
          <div className="hero-actions"><Link className="button button-primary" href="/boutique">{t("discover")}</Link></div>
        </div>
        <div className="hero-stage"><HeroOrbit progress={scrollYProgress} /></div>
      </div>
    </section>
  );
}
