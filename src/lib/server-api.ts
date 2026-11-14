import { cacheLife } from "next/cache";
import type { Category, Product } from "@/lib/catalog";
import type { HomeContent, PolicyLink, PolicyPage } from "@/lib/content";

/**
 * Server-side reads of the public API, cached by Next ("use cache"). Pages render
 * with real content in the HTML (SEO, faster first paint); the cache refreshes in
 * the background every minute so admin edits appear quickly.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1";
export const SITE_URL = "https://m04.shop";

async function read<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function allProducts(): Promise<Product[]> {
  const products: Product[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await read<{ data: Product[]; last_page: number }>(`/products?per_page=50&page=${page}`);
    if (!response) break;
    products.push(...response.data);
    if (page >= response.last_page) break;
  }
  return products;
}

export async function getCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  "use cache";
  cacheLife("minutes");
  const [products, categories] = await Promise.all([allProducts(), read<{ data: Category[] }>("/categories")]);
  return { products, categories: categories?.data ?? [] };
}

export async function getHome(): Promise<HomeContent | null> {
  "use cache";
  cacheLife("minutes");
  return (await read<{ data: HomeContent }>("/home"))?.data ?? null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  return (await read<{ data: Product }>(`/products/${encodeURIComponent(slug)}`))?.data ?? null;
}

export async function getPolicies(): Promise<PolicyLink[]> {
  "use cache";
  cacheLife("hours");
  return (await read<{ data: PolicyLink[] }>("/pages"))?.data ?? [];
}

export async function getPolicy(slug: string): Promise<PolicyPage | null> {
  "use cache";
  cacheLife("minutes");
  return (await read<{ data: PolicyPage }>(`/pages/${encodeURIComponent(slug)}`))?.data ?? null;
}

export async function getTracking(): Promise<{ enabled: boolean; pixel_ids: string[]; domain_verification?: string } | null> {
  "use cache";
  // Minutes, so a pixel ID changed in the admin reaches the pages quickly.
  cacheLife("minutes");
  return (await read<{ data: { enabled: boolean; pixel_ids: string[]; domain_verification?: string } }>("/tracking"))?.data ?? null;
}

/** Plain-text excerpt for meta descriptions. */
export function excerpt(text: string | null | undefined, length = 155): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1).trimEnd()}…` : clean;
}
