"use client";

import Link from "next/link";
import { useStore } from "@/lib/storefront";

export function NotFoundView() {
  const { t } = useStore();
  return (
    <main className="page-wrap confirmation-page">
      <p className="section-kicker">404</p>
      <h1>{t("pageNotFound")}</h1>
      <Link className="button button-primary" href="/boutique">{t("discover")}</Link>
    </main>
  );
}
