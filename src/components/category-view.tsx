"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ProductGrid } from "@/components/product-grid";
import type { Category, Product } from "@/lib/catalog";
import { categoryPath } from "@/lib/seo";
import { translateCategory, useStore } from "@/lib/storefront";

/**
 * Category landing page. The heading stays in French (the words people search in
 * Google); the rest follows the visitor's language.
 */
export function CategoryView({
  category,
  products,
  categories,
  title,
  about,
}: {
  category: Category;
  products: Product[];
  categories: Category[];
  title: string;
  about: ReactNode;
}) {
  const { language, t } = useStore();
  const name = translateCategory(category.slug, category.name, language);
  const others = categories.filter((item) => item.products_count > 0);

  return (
    <main className="page-wrap category-page">
      <div className="breadcrumb">
        <Link href="/">{t("home")}</Link><span aria-hidden="true">/</span>
        <Link href="/boutique">{t("shop")}</Link><span aria-hidden="true">/</span>
        <span dir="auto">{name}</span>
      </div>
      <header className="category-hero">
        <p className="section-kicker" dir="auto">{name} · {products.length} {t("productsCount")}</p>
        <h1 lang="fr" dir="ltr">{title}</h1>
        <p dir="auto">{t("trustText")}</p>
      </header>

      {others.length > 1 ? (
        <nav className="category-chips" aria-label={t("categories")}>
          <Link href="/boutique">{t("all")}</Link>
          {others.map((item) => (
            <Link key={item.id} href={categoryPath(item.slug)} aria-current={item.slug === category.slug ? "page" : undefined} dir="auto">
              {translateCategory(item.slug, item.name, language)}
            </Link>
          ))}
        </nav>
      ) : null}

      {products.length ? <ProductGrid products={products} /> : <p className="state-message">{t("emptyProduct")}</p>}

      {about}
    </main>
  );
}
