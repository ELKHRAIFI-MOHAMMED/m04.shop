import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { ProductDetail } from "@/components/product-detail";
import { isReadableDescription, type Product } from "@/lib/catalog";
import { categoryPath, categorySeo } from "@/lib/seo";
import { SITE_URL, excerpt, getCatalog, getProductBySlug } from "@/lib/server-api";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  // At least one entry is required; unknown slugs still render on demand.
  return products.length ? products.map((product) => ({ slug: product.slug })) : [{ slug: "produit" }];
}

/** Product text usable in a meta description (some legacy products store a translation key). */
function readableDescription(product: Product): string | null {
  return isReadableDescription(product.description) ? product.description : null;
}

function price(product: Product): string {
  return `${Math.round(Number(product.current_price))} DH`;
}

export async function generateMetadata({ params }: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable", robots: { index: false } };
  const image = product.card_image_url ?? product.images[0]?.url;
  const category = product.categories[0];
  // Admin SEO fields first; otherwise "AirPods Pro 2 au Maroc – 299 DH".
  const title = product.seo_title?.trim() || `${product.name} au Maroc – ${price(product)}`;
  const description = excerpt(
    product.seo_description?.trim()
      || `${product.name} au meilleur prix au Maroc : ${price(product)}. ${readableDescription(product) ?? ""} Paiement à la livraison, livraison partout au Maroc.`,
  );
  return {
    title,
    description,
    keywords: [product.name, `${product.name} Maroc`, `${product.name} prix Maroc`, ...(category ? categorySeo(category.slug, category.name).keywords : []), "m04.shop"],
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: { type: "website", title: `${title} | m04.shop`, description, url: `${SITE_URL}/produits/${product.slug}`, images: image ? [{ url: image, alt: product.name }] : undefined },
    twitter: { card: "summary_large_image", title: `${title} | m04.shop`, description, images: image ? [image] : undefined },
  };
}

export default function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  return (
    <Suspense fallback={<main className="page-wrap"><p className="state-message">…</p></main>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/produits/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const inStock = product?.variants.some((variant) => variant.available) ?? false;
  const category = product?.categories[0];
  const url = product ? `${SITE_URL}/produits/${product.slug}` : "";

  return (
    <>
      {product ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "@id": `${url}#product`,
                name: product.name,
                url,
                image: product.images.map((image) => image.url).slice(0, 6),
                description: excerpt(product.seo_description || readableDescription(product) || `${product.name} au Maroc, paiement à la livraison.`, 500),
                sku: String(product.id),
                category: category?.name,
                offers: {
                  "@type": "Offer",
                  url,
                  priceCurrency: "MAD",
                  price: Number(product.current_price).toFixed(2),
                  availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  itemCondition: "https://schema.org/NewCondition",
                  seller: { "@type": "Organization", name: "m04.shop", url: SITE_URL },
                  shippingDetails: { "@type": "OfferShippingDetails", shippingDestination: { "@type": "DefinedRegion", addressCountry: "MA" } },
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
                  ...(category
                    ? [{ "@type": "ListItem", position: 2, name: categorySeo(category.slug, category.name).title, item: `${SITE_URL}${categoryPath(category.slug)}` }]
                    : [{ "@type": "ListItem", position: 2, name: "Boutique", item: `${SITE_URL}/boutique` }]),
                  { "@type": "ListItem", position: 3, name: product.name, item: url },
                ],
              },
            ],
          }}
        />
      ) : null}
      <ProductDetail slug={slug} initialProduct={product} />
    </>
  );
}
