"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState, type CSSProperties } from "react";
import { ArrowRightIcon, HandCoinsIcon, HeadsetIcon, SealCheckIcon, TruckIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Category, Product } from "@/lib/catalog";
import { categoryPath } from "@/lib/seo";
import { HERO_WORDS, formatPrice, translateCategory, useStore, type Language } from "@/lib/storefront";

/**
 * Home hero: the heading appears word by word, then a product word is typed, waits a
 * moment, is erased and the next one is typed. Pure CSS for the entrance (it runs
 * before React loads); the typing starts once the heading is in place.
 */
export function HomeHero({ products }: { products: Product[] }) {
  const { language, t } = useStore();
  const rtl = language === "ary";
  const line1 = t("heroLine1").split(" ");
  const line2 = t("heroLine2").split(" ");
  let wordIndex = 0;
  const word = (text: string, key: string) => (
    <span className="hx-word" key={key} style={{ "--i": wordIndex++ } as CSSProperties}>{text}</span>
  );
  const shown = products.slice(0, 3);

  return (
    <section className="hx" aria-labelledby="hx-title">
      <div className="hx-bg" aria-hidden="true" />
      <div className="page-wrap hx-layout">
        <div className="hx-copy">
          <p className="hx-kicker hx-fade" style={{ "--d": "0ms" } as CSSProperties}>
            <span className="hx-kicker-dot" aria-hidden="true" />
            <span>m04.shop</span>
            <span className="hx-kicker-sep" aria-hidden="true" />
            <span>{t("heroKicker")}</span>
          </p>
          <h1 id="hx-title" className="hx-title" dir="auto">
            <span className="hx-title-line">{line1.map((text, i) => <Fragment key={`a${i}`}>{i ? " " : null}{word(text, `a${i}`)}</Fragment>)}</span>
            <span className="hx-title-line hx-title-accent">{line2.map((text, i) => <Fragment key={`b${i}`}>{i ? " " : null}{word(text, `b${i}`)}</Fragment>)}</span>
          </h1>
          <TypedLine key={language} language={language} label={t("heroFor")} />
          <p className="hx-text hx-fade" style={{ "--d": "520ms" } as CSSProperties} dir="auto">{t("heroIntro")}</p>
          <div className="hx-actions hx-fade" style={{ "--d": "640ms" } as CSSProperties}>
            <Link className="button button-primary hx-cta" href="/boutique">
              {t("heroPrimary")}
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" className={rtl ? "flip-x" : undefined} />
            </Link>
            <Link className="button button-ghost" href="/#nouveautes">{t("heroSecondary")}</Link>
          </div>
          <ul className="hx-trust hx-fade" style={{ "--d": "760ms" } as CSSProperties}>
            <li><span><HandCoinsIcon size={18} aria-hidden="true" /></span>{t("cod")}</li>
            <li><span><TruckIcon size={18} aria-hidden="true" /></span>{t("freeDelivery")}</li>
            <li><span><HeadsetIcon size={18} aria-hidden="true" /></span>{t("support")}</li>
          </ul>
        </div>

        <div className="hx-visual hx-fade" style={{ "--d": "300ms" } as CSSProperties}>
          <div className="hx-showcase" data-count={Math.max(1, shown.length)}>
            {shown.length ? shown.map((product, index) => (
              <Link
                key={product.id}
                href={`/produits/${encodeURIComponent(product.slug)}`}
                className="hx-card"
                style={{ "--i": index } as CSSProperties}
              >
                {product.card_image_url ?? product.images[0]?.url ? (
                  <Image
                    src={(product.card_image_url ?? product.images[0]?.url) as string}
                    alt={product.name}
                    fill
                    sizes="(max-width: 760px) 60vw, (max-width: 1080px) 33vw, 320px"
                    unoptimized
                    preload={index === 0}
                  />
                ) : null}
                <span className="hx-card-info">
                  <span dir="auto">{product.name}</span>
                  <b>{formatPrice(product.current_price, language)}</b>
                </span>
              </Link>
            )) : (
              <span className="hx-card hx-card-brand">
                <Image src="/brand/m04-logo.png" alt="m04.shop" width={220} height={220} preload />
              </span>
            )}
          </div>
          <p className="hx-badge" aria-hidden="true"><SealCheckIcon size={20} weight="fill" />{t("heroBadge")}</p>
        </div>
      </div>
    </section>
  );
}

/** "Pour vos AirPods|": types each word, waits, erases it and goes to the next. */
function TypedLine({ language, label }: { language: Language; label: string }) {
  const words = HERO_WORDS[language];
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState({ index: 0, length: words[0].length, deleting: false, started: false });

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const current = words[state.index];
    let delay = state.deleting ? 40 : 80;
    if (!state.started) delay = 2600; // first word stays while the heading appears
    else if (!state.deleting && state.length === current.length) delay = 1900; // tesna chwiya
    else if (state.deleting && state.length === 0) delay = 300;
    const timer = window.setTimeout(() => {
      setState((s) => {
        const word = words[s.index];
        if (!s.started || (!s.deleting && s.length === word.length)) return { ...s, deleting: true, started: true };
        if (s.deleting && s.length === 0) return { index: (s.index + 1) % words.length, length: 0, deleting: false, started: true };
        return { ...s, length: s.length + (s.deleting ? -1 : 1) };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [state, words, reduceMotion]);

  const text = Array.from(words[state.index]).slice(0, state.length).join("");
  return (
    <p className="hx-typed hx-fade" style={{ "--d": "380ms" } as CSSProperties}>
      <span>{label} </span>
      <span className="hx-typed-word" aria-hidden="true">{text}</span>
      <span className="hx-caret" aria-hidden="true" />
      <span className="sr-only">{words.join(", ")}</span>
    </p>
  );
}

/** Endless band of product words linking to the matching category or search. */
export function KeywordMarquee({ categories }: { categories: Category[] }) {
  const { language, t } = useStore();
  const items = categories.filter((category) => category.products_count > 0).map((category) => ({
    href: categoryPath(category.slug),
    label: translateCategory(category.slug, category.name, language),
  }));
  const extra = HERO_WORDS[language].map((word) => ({ href: `/boutique?q=${encodeURIComponent(HERO_WORDS.fr[HERO_WORDS[language].indexOf(word)])}`, label: word }));
  const seen = new Set<string>();
  const links = [...items, ...extra].filter((link) => {
    const key = link.label.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!links.length) return null;

  const group = (hidden: boolean) => (
    <div className="hx-marquee-group" aria-hidden={hidden || undefined}>
      {links.map((link) => (
        <Link key={link.href + link.label} href={link.href} tabIndex={hidden ? -1 : undefined} dir="auto">{link.label}</Link>
      ))}
    </div>
  );

  return (
    <nav className="hx-marquee" aria-label={t("keywordsLabel")}>
      <div className="hx-marquee-track">
        {group(false)}
        {group(true)}
      </div>
    </nav>
  );
}
