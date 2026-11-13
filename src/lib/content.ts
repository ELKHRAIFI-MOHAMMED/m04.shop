import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/catalog";

type Localized = { fr: string; ary: string };

export type Slide = {
  id: string;
  link: string;
  alt: string;
  title: Localized;
  text: Localized;
  cta: Localized;
  image: string;
  mobile_image: string | null;
  dark_image: string | null;
  dark_mobile_image: string | null;
};

export type Social = { instagram: string; facebook: string; whatsapp: string; tiktok: string };

export type HomeContent = {
  slides: Slide[];
  sections: {
    show_offers: boolean;
    show_categories: boolean;
    show_best_sellers: boolean;
    show_reviews: boolean;
    autoplay: boolean;
    reviews_title_fr: string;
    reviews_title_ary: string;
    reviews_text_fr: string;
    reviews_text_ary: string;
  };
  social: Social;
  reviews: { url: string; width: number; height: number }[];
};

export type PolicyLink = { slug: string; title: Localized };
export type PolicyPage = PolicyLink & { body: Localized; social: Social };

let homeRequest: Promise<HomeContent> | null = null;
let pagesRequest: Promise<PolicyLink[]> | null = null;

/** Home content is shared by the home page and the footer, so it is requested once per visit. */
export function getHomeContent(): Promise<HomeContent> {
  homeRequest ??= apiFetch<{ data: HomeContent }>("/home").then((response) => response.data).catch((error: unknown) => {
    homeRequest = null;
    throw error;
  });
  return homeRequest;
}

export function getPolicyLinks(): Promise<PolicyLink[]> {
  pagesRequest ??= apiFetch<{ data: PolicyLink[] }>("/pages").then((response) => response.data).catch((error: unknown) => {
    pagesRequest = null;
    throw error;
  });
  return pagesRequest;
}

export async function getPolicyPage(slug: string): Promise<PolicyPage | null> {
  try {
    return (await apiFetch<{ data: PolicyPage }>(`/pages/${encodeURIComponent(slug)}`)).data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) return null;
    throw error;
  }
}

/** Every active product, following the API pages (50 per page). */
export async function getAllProducts(): Promise<Product[]> {
  const products: Product[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await apiFetch<{ data: Product[]; last_page: number }>(`/products?per_page=50&page=${page}`);
    products.push(...response.data);
    if (page >= response.last_page) break;
  }
  return products;
}

export function whatsappLink(number: string, text?: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** "+212 620-638999" style display for a Moroccan WhatsApp number. */
export function formatWhatsapp(number: string): string {
  const digits = number.replace(/\D/g, "");
  return digits.length === 12 ? `+${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}` : `+${digits}`;
}
