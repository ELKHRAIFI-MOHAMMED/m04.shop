import type { MetadataRoute } from "next";
import { categoryPath } from "@/lib/seo";
import { SITE_URL, getCatalog, getPolicies } from "@/lib/server-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products, categories }, pages] = await Promise.all([getCatalog(), getPolicies()]);
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/boutique`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...categories
      .filter((category) => category.products_count > 0)
      .map((category) => ({ url: `${SITE_URL}${categoryPath(category.slug)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.85 })),
    ...products.map((product) => ({
      url: `${SITE_URL}/produits/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [product.card_image_url ?? product.images[0]?.url].filter((url): url is string => !!url),
    })),
    ...pages.map((page) => ({ url: `${SITE_URL}/politiques/${page.slug}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
