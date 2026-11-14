export type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  products_count: number;
  homepage_visible?: boolean;
};

export type PurchaseMode = "cart" | "checkout" | "both";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  sale_price: string | null;
  current_price: string;
  featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  /** "cart": add-to-cart button, "checkout": direct order form, "both": form and button. */
  purchase_mode?: PurchaseMode;
  seo_title?: string | null;
  seo_description?: string | null;
  categories: { id: number; name: string; slug: string }[];
  images: { url: string; alt: string | null }[];
  card_image_url?: string | null;
  /** Name of the second choice next to the colour (Puissance, Taille…), set per product in the admin. */
  variant_option_label?: string | null;
  /** How that second choice is shown: buttons or a dropdown list. */
  option_display?: "buttons" | "select";
  variants: {
    id: number;
    name: string;
    available: boolean;
    color?: string | null;
    color_hex?: string | null;
    /** Value of the second choice (e.g. "25W"). */
    capacity?: string | null;
    price?: string | null;
    image_url?: string | null;
  }[];
  offers?: Offer[];
  /** Landing page sections built in the admin (product page only). */
  sections?: LandingSection[];
};

/** One landing page section: its type and its fields ("title_fr", "title_ary", "items"…). */
export type LandingSection = { id: number; type: string } & Record<string, unknown>;

export type Offer = { id: number; name: string; badge: string | null; quantity: number; total: string; unit_price: number; image_url: string | null };

/** Some legacy products store a translation key ("laptop_stand_two.description") instead of text. */
export function isReadableDescription(text: string | null | undefined): text is string {
  return !!text && !/^[a-z0-9_]+\.[a-z0-9_.]+$/i.test(text.trim());
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1";

class CatalogRequestError extends Error {
  constructor(readonly status: number) {
    super(`Catalog request failed (${status}).`);
  }
}

async function getData<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) throw new CatalogRequestError(response.status);
  return response.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  const result = await getData<{ data?: Product[] }>("/products?per_page=50");
  return result.data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const result = await getData<{ data?: Category[] }>("/categories");
  return result.data ?? [];
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const result = await getData<{ data?: Product | null }>(`/products/${encodeURIComponent(slug)}`);
    return result.data ?? null;
  } catch (error) {
    if (error instanceof CatalogRequestError && error.status === 404) return null;
    throw error;
  }
}
