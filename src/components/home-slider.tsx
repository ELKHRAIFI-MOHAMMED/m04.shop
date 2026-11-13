"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Slide } from "@/lib/content";
import { useStore } from "@/lib/storefront";

const INTERVAL = 6000;

/**
 * Brand slides. Each slide can have light/dark and desktop/mobile images; the theme
 * toggle picks light or dark, a <picture> source picks mobile on small screens.
 * Transitions are a CSS fade, so the slider needs no animation library.
 */
export function HomeSlider({ slides, autoplay }: { slides: Slide[]; autoplay: boolean }) {
  const { language, dark, t } = useStore();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // No fade on the first image: it shows as soon as it scrolls into view.
  const [moved, setMoved] = useState(false);
  // Square visuals (category packshots) are shown whole instead of cropped.
  const [fitted, setFitted] = useState<Record<string, boolean>>({});
  const drag = useRef<{ x: number; id: number } | null>(null);
  const rtl = language === "ary";
  const count = slides.length;

  const go = useCallback((next: number) => {
    setMoved(true);
    setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (!autoplay || paused || reduceMotion || count < 2) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [autoplay, paused, reduceMotion, count, index, go]);

  if (!count) return null;
  const slide = slides[Math.min(index, count - 1)];
  const desktop = (dark ? slide.dark_image : null) ?? slide.image;
  const mobile = (dark ? slide.dark_mobile_image ?? slide.dark_image : null) ?? slide.mobile_image ?? desktop;
  const title = slide.title[language] || slide.title.fr;
  const text = slide.text[language] || slide.text.fr;
  const cta = slide.cta[language] || slide.cta.fr;
  // The hero above holds the page's h1; slide titles are section headings.
  const Heading = "h2";

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, id: event.pointerId };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    const delta = event.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(delta) < 50) return;
    // Swiping towards the reading direction shows the next slide.
    const forward = rtl ? delta > 0 : delta < 0;
    go(index + (forward ? 1 : -1));
  }

  return (
    <section
      className="slider"
      aria-roledescription="carousel"
      aria-label="m04.shop"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + (rtl ? -1 : 1));
        if (event.key === "ArrowLeft") go(index + (rtl ? 1 : -1));
      }}
    >
      <div className="slider-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (drag.current = null)}>
        <div
          key={`${slide.id}-${dark ? "dark" : "light"}`}
          className={`slide${fitted[slide.id] ? " is-fitted" : ""}${moved ? " is-entering" : ""}`}
          role="group"
          aria-roledescription={t("slide")}
          aria-label={`${index + 1} / ${count}`}
        >
          <picture className="slide-media">
            <source media="(max-width: 700px)" srcSet={mobile} />
            <img
              src={desktop}
              alt={slide.alt || title}
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                const square = naturalWidth / Math.max(1, naturalHeight) < 1.6 && window.innerWidth > 700;
                setFitted((current) => (current[slide.id] === square ? current : { ...current, [slide.id]: square }));
              }}
            />
          </picture>
          <div className="slide-shade" aria-hidden="true" />
          {title || text || cta ? (
            <div className="page-wrap slide-copy">
              <div className="slide-copy-inner">
                {title ? <Heading className="slide-title" dir="auto">{title}</Heading> : null}
                {text ? <p className="slide-text" dir="auto">{text}</p> : null}
                {cta ? <Link className="button button-primary" href={slide.link || "/boutique"}>{cta}</Link> : null}
              </div>
            </div>
          ) : (
            <Link className="slide-link" href={slide.link || "/boutique"} aria-label={slide.alt || "m04.shop"} />
          )}
        </div>
      </div>

      {count > 1 ? (
        <>
          <button type="button" className="slider-arrow slider-prev" onClick={() => go(index - 1)} aria-label={t("previous")}>
            {rtl ? <CaretRightIcon size={20} weight="bold" /> : <CaretLeftIcon size={20} weight="bold" />}
          </button>
          <button type="button" className="slider-arrow slider-next" onClick={() => go(index + 1)} aria-label={t("next")}>
            {rtl ? <CaretLeftIcon size={20} weight="bold" /> : <CaretRightIcon size={20} weight="bold" />}
          </button>
          <div className="slider-dots" role="tablist" aria-label={t("slide")}>
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${t("slide")} ${i + 1}`}
                className={i === index ? "slider-dot is-active" : "slider-dot"}
                onClick={() => go(i)}
              >
                <span className="slider-dot-mark">
                  {i === index && autoplay && !paused && !reduceMotion ? <span key={index} className="slider-dot-progress" /> : null}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
