"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FacebookLogoIcon, HandCoinsIcon, InstagramLogoIcon, TiktokLogoIcon, TruckIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/brand-logo";
import { formatWhatsapp, getHomeContent, getPolicyLinks, whatsappLink, type PolicyLink, type Social } from "@/lib/content";
import { useStore } from "@/lib/storefront";

const FALLBACK_SOCIAL: Social = {
  instagram: "https://www.instagram.com/m04shop/",
  facebook: "https://www.facebook.com/profile.php?id=61553898094335",
  whatsapp: "212620638999",
  tiktok: "",
};

export function SiteFooter() {
  const { language, t } = useStore();
  const [social, setSocial] = useState<Social>(FALLBACK_SOCIAL);
  const [pages, setPages] = useState<PolicyLink[]>([]);

  useEffect(() => {
    getHomeContent().then((home) => setSocial(home.social)).catch(() => undefined);
    getPolicyLinks().then(setPages).catch(() => undefined);
  }, []);

  const links = [
    social.instagram ? { href: social.instagram, label: "Instagram", handle: "@m04shop", icon: <InstagramLogoIcon size={20} /> } : null,
    social.whatsapp ? { href: whatsappLink(social.whatsapp), label: "WhatsApp", handle: formatWhatsapp(social.whatsapp), icon: <WhatsappLogoIcon size={20} /> } : null,
    social.facebook ? { href: social.facebook, label: "Facebook", handle: "m04.shop", icon: <FacebookLogoIcon size={20} /> } : null,
    social.tiktok ? { href: social.tiktok, label: "TikTok", handle: "m04.shop", icon: <TiktokLogoIcon size={20} /> } : null,
  ].filter((link) => link !== null);

  return (
    <footer className="site-footer">
      <div className="page-wrap footer-main">
        <div className="footer-brand">
          <BrandLogo size={64} />
          <p>{t("footerText")}</p>
          <ul className="footer-promise">
            <li><HandCoinsIcon size={16} aria-hidden="true" />{t("cod")}</li>
            <li><TruckIcon size={16} aria-hidden="true" />{t("freeDelivery")}</li>
          </ul>
        </div>
        <div className="footer-column">
          <h2>{t("quickLinks")}</h2>
          <Link href="/">{t("home")}</Link>
          <Link href="/boutique">{t("shop")}</Link>
          <Link href="/#categories">{t("categories")}</Link>
          <Link href="/panier">{t("cart")}</Link>
        </div>
        <div className="footer-column">
          <h2>{t("policies")}</h2>
          {pages.map((page) => (
            <Link key={page.slug} href={`/politiques/${page.slug}`}>{page.title[language] || page.title.fr}</Link>
          ))}
        </div>
        <div className="footer-column footer-social">
          <h2>{t("followUs")}</h2>
          {links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="social-icon" aria-hidden="true">{link.icon}</span>
              <span>
                <b>{link.label}</b>
                <small dir="ltr">{link.handle}</small>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div className="page-wrap footer-bottom">
        <span>© m04.shop. {t("rights")}</span>
        <span>Maroc</span>
      </div>
    </footer>
  );
}
