"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts, type Category, type Product } from "@/lib/catalog";
import { translateCategory, useStore } from "@/lib/storefront";

type SortOrder = "recent" | "price_asc" | "price_desc";

type CatalogInitial = { products: Product[]; categories: Category[] };

export function CatalogBrowser({ initial }: { initial?: CatalogInitial }) {
  const searchParams = useSearchParams();
  return (
    <CatalogView
      initial={initial}
      key={searchParams.toString()}
      initialQuery={searchParams.get("q") ?? ""}
      initialCategory={searchParams.get("category") ?? ""}
    />
  );
}

function CatalogView({ initial, initialQuery, initialCategory }: { initial?: CatalogInitial; initialQuery: string; initialCategory: string }) {
  const { language, t } = useStore();
  const ready = !!initial && initial.products.length > 0;
  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [categories, setCategories] = useState<Category[]>(initial?.categories ?? []);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [sort, setSort] = useState<SortOrder>("recent");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(!ready);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) return;
    let active = true;
    Promise.all([getProducts(), getCategories()])
      .then(([nextProducts, nextCategories]) => {
        if (!active) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
      })
      .catch((error: unknown) => {
        console.error("Could not load the m04.shop catalog.", error);
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready]);

  const filteredProducts = useMemo(() => {
    const searchTerm = query.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = !category || product.categories.some((item) => item.slug === category);
      const matchesSearch = !searchTerm || `${product.name} ${product.description ?? ""}`.toLocaleLowerCase().includes(searchTerm);
      const price = Number(product.current_price);
      const matchesMinimum = !minimum || price >= Number(minimum);
      const matchesMaximum = !maximum || price <= Number(maximum);
      const matchesStock = !inStockOnly || product.variants.some((variant) => variant.available);
      return matchesCategory && matchesSearch && matchesMinimum && matchesMaximum && matchesStock;
    });

    if (sort === "price_asc") filtered.sort((a, b) => Number(a.current_price) - Number(b.current_price));
    if (sort === "price_desc") filtered.sort((a, b) => Number(b.current_price) - Number(a.current_price));
    return filtered;
  }, [products, category, query, minimum, maximum, sort, inStockOnly]);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setMinimum("");
    setMaximum("");
    setSort("recent");
    setInStockOnly(false);
  }

  return (
    <main className="page-wrap catalog-page">
      <div className="breadcrumb"><Link href="/">{t("home")}</Link><span aria-hidden="true">/</span><span>{t("shop")}</span></div>
      <header className="catalog-heading">
        <div><h1>{t("catalogTitle")}</h1><p>{t("catalogText")}</p></div>
        {!loading && !failed ? <span className="results-count">{filteredProducts.length} {t("productsFound")}</span> : null}
      </header>

      <section className="catalog-controls" aria-label={t("filters")}>
        <label className="filter-field filter-search">
          <span>{t("searchLabel")}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} />
        </label>
        <label className="filter-field">
          <span>{t("filterCategory")}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t("all")}</option>
            {categories.map((item) => <option value={item.slug} key={item.id}>{translateCategory(item.slug, item.name, language)}</option>)}
          </select>
        </label>
        <label className="filter-field filter-price">
          <span>{t("min")}</span>
          <input inputMode="numeric" min="0" type="number" value={minimum} onChange={(event) => setMinimum(event.target.value)} placeholder="DH" />
        </label>
        <label className="filter-field filter-price">
          <span>{t("max")}</span>
          <input inputMode="numeric" min="0" type="number" value={maximum} onChange={(event) => setMaximum(event.target.value)} placeholder="DH" />
        </label>
        <label className="filter-field">
          <span>{t("sort")}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
            <option value="recent">{t("recent")}</option>
            <option value="price_asc">{t("priceLow")}</option>
            <option value="price_desc">{t("priceHigh")}</option>
          </select>
        </label>
        <label className="stock-filter"><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} />{t("inStock")}</label>
        <button className="text-link clear-filters" type="button" onClick={clearFilters}>{t("clear")}</button>
      </section>

      {loading ? <p className="state-message" role="status">{t("loading")}</p> : null}
      {failed ? <p className="state-message state-error" role="alert">{t("loadError")}</p> : null}
      {!loading && !failed && filteredProducts.length ? (
        <ProductGrid className="catalog-grid" products={filteredProducts} />
      ) : null}
      {!loading && !failed && !filteredProducts.length ? <p className="state-message">{t("noProducts")}</p> : null}
    </main>
  );
}
