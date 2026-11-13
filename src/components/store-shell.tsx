"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MagnifyingGlassIcon, MoonIcon, ShoppingBagIcon, SunIcon, TruckIcon } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/storefront";

type CartResponse = { data: { quantity: number }[] };

export function StoreShell({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, dark, toggleTheme, t } = useStore();
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      apiFetch<CartResponse>("/cart")
        .then((cart) => {
          if (active) setCartCount(cart.data.reduce((count, line) => count + line.quantity, 0));
        })
        .catch((error: unknown) => console.error("Could not load the m04.shop cart count.", error));
    };
    refresh();
    window.addEventListener("m04-cart-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("m04-cart-updated", refresh);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="announcement">
        <TruckIcon size={16} weight="bold" aria-hidden="true" />
        <span>{t("shipping")}</span>
      </div>
      <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
        <div className="page-wrap header-inner">
          <BrandLogo tagline={t("tagline")} />
          <nav className="desktop-nav" aria-label={t("quickLinks")}>
            <Suspense fallback={<NavLinks pathname="" />}>
              <CurrentNavLinks />
            </Suspense>
          </nav>
          <form className="header-search" action="/boutique" role="search">
            <MagnifyingGlassIcon size={18} aria-hidden="true" />
            <input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} aria-label={t("searchLabel")} />
          </form>
          <div className="header-actions">
            <button className="utility-button language-button" type="button" onClick={() => setLanguage(language === "fr" ? "ary" : "fr")} aria-label={t("language")}>
              {language === "fr" ? "عربية" : "FR"}
            </button>
            <button className="utility-button" type="button" onClick={toggleTheme} aria-label={dark ? t("light") : t("dark")} title={dark ? t("light") : t("dark")}>
              {dark ? <SunIcon size={18} aria-hidden="true" /> : <MoonIcon size={18} aria-hidden="true" />}
            </button>
            <Link className="cart-button" href="/panier" aria-label={`${t("cart")}, ${cartCount}`}>
              <ShoppingBagIcon size={19} aria-hidden="true" />
              <span className="cart-label">{t("cart")}</span>
              <span className="cart-badge" data-empty={cartCount === 0 ? "" : undefined}>{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>
      <nav className="mobile-categories" aria-label={t("categories")}>
        <Link href="/boutique">{t("all")}</Link>
        <Link href="/#categories">{t("categories")}</Link>
        <Link href="/#nouveautes">{t("offers")}</Link>
      </nav>
      {children}
      <SiteFooter />
    </>
  );
}

function CurrentNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string }) {
  const { t } = useStore();
  const links = [
    { href: "/", label: t("home"), current: pathname === "/" },
    { href: "/boutique", label: t("shop"), current: pathname.startsWith("/boutique") },
    { href: "/#categories", label: t("categories"), current: false },
    { href: "/#nouveautes", label: t("offers"), current: false },
  ];
  return links.map((link) => (
    <Link key={link.href} href={link.href} aria-current={link.current ? "page" : undefined}>{link.label}</Link>
  ));
}
