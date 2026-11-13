"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FacebookLogoIcon, InstagramLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { formatWhatsapp, getPolicyLinks, getPolicyPage, whatsappLink, type PolicyLink, type PolicyPage } from "@/lib/content";
import { useStore } from "@/lib/storefront";

export function PolicyView({ slug, initialPage, initialLinks }: { slug: string; initialPage?: PolicyPage | null; initialLinks?: PolicyLink[] }) {
  const { language, t } = useStore();
  const [result, setResult] = useState<{ slug: string; page: PolicyPage | null; failed: boolean } | null>(
    initialPage !== undefined ? { slug, page: initialPage, failed: false } : null,
  );
  const [links, setLinks] = useState<PolicyLink[]>(initialLinks ?? []);

  useEffect(() => {
    if (initialPage !== undefined && initialLinks?.length) return;
    let active = true;
    getPolicyPage(slug)
      .then((page) => active && setResult({ slug, page, failed: false }))
      .catch(() => active && setResult({ slug, page: null, failed: true }));
    getPolicyLinks().then((pages) => active && setLinks(pages)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug, initialPage, initialLinks]);

  if (result?.slug !== slug) return <main className="page-wrap policy-page"><p className="state-message" role="status">{t("loading")}</p></main>;
  if (!result.page) {
    return (
      <main className="page-wrap policy-page">
        <p className="state-message state-error" role="alert">{result.failed ? t("loadError") : t("pageNotFound")}</p>
        <Link className="text-link" href="/">{t("home")}</Link>
      </main>
    );
  }

  const page = result.page;
  const title = page.title[language] || page.title.fr;
  const body = page.body[language] || page.body.fr;

  return (
    <main className="page-wrap policy-page">
      <div className="breadcrumb"><Link href="/">{t("home")}</Link><span aria-hidden="true">/</span><span>{title}</span></div>
      <div className="policy-layout">
        <nav className="policy-nav" aria-label={t("policies")}>
          {links.map((link) => (
            <Link key={link.slug} href={`/politiques/${link.slug}`} aria-current={link.slug === slug ? "page" : undefined}>
              {link.title[language] || link.title.fr}
            </Link>
          ))}
        </nav>
        <article className="policy-article" dir="auto">
          <h1>{title}</h1>
          {body.split(/\n{2,}/).flatMap((block, index) =>
            block.split("\n").map((line, lineIndex) =>
              line.startsWith("## ") ? <h2 key={`${index}-${lineIndex}`}>{line.slice(3)}</h2> : line.trim() ? <p key={`${index}-${lineIndex}`}>{line}</p> : null,
            ),
          )}
          {slug === "contact" || slug === "retours" ? (
            <div className="policy-contact">
              {page.social.whatsapp ? <a className="button button-primary" href={whatsappLink(page.social.whatsapp)} target="_blank" rel="noopener noreferrer"><WhatsappLogoIcon size={20} /> {t("writeUs")} · <span dir="ltr">{formatWhatsapp(page.social.whatsapp)}</span></a> : null}
              {page.social.instagram ? <a className="button button-ghost" href={page.social.instagram} target="_blank" rel="noopener noreferrer"><InstagramLogoIcon size={20} /> Instagram</a> : null}
              {page.social.facebook ? <a className="button button-ghost" href={page.social.facebook} target="_blank" rel="noopener noreferrer"><FacebookLogoIcon size={20} /> Facebook</a> : null}
            </div>
          ) : null}
        </article>
      </div>
    </main>
  );
}
