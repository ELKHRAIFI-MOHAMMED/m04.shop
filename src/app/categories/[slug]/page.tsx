import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryView } from "@/components/category-view";
import { JsonLd } from "@/components/json-ld";
import { categoryPath, categorySeo } from "@/lib/seo";
import { SITE_URL, getCatalog } from "@/lib/server-api";

export async function generateStaticParams() {
  const { categories } = await getCatalog();
  // At least one entry is required; unknown slugs still render on demand.
  return categories.length ? categories.map((category) => ({ slug: category.slug })) : [{ slug: "accessoires" }];
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalog();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "Catégorie introuvable", robots: { index: false } };
  const seo = categorySeo(category.slug, category.name);
  return {
    title: seo.title,
    description: seo.description,
    keywords: [...seo.keywords, "m04.shop", "m04"],
    alternates: { canonical: categoryPath(category.slug) },
    openGraph: {
      type: "website",
      title: `${seo.title} | m04.shop`,
      description: seo.description,
      url: `${SITE_URL}${categoryPath(category.slug)}`,
      images: category.image_url ? [{ url: category.image_url, alt: seo.title }] : undefined,
    },
  };
}

export default function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  return (
    <Suspense fallback={<main className="page-wrap"><p className="state-message">…</p></main>}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: { params: PageProps<"/categories/[slug]">["params"] }) {
  const { slug } = await params;
  const { products, categories } = await getCatalog();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const seo = categorySeo(category.slug, category.name);
  const inCategory = products.filter((product) => product.categories.some((item) => item.slug === slug));
  const url = `${SITE_URL}${categoryPath(category.slug)}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: seo.title,
              description: seo.description,
              url,
              isPartOf: { "@id": `${SITE_URL}/#website` },
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: inCategory.length,
                itemListElement: inCategory.slice(0, 30).map((product, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: `${SITE_URL}/produits/${product.slug}`,
                  name: product.name,
                })),
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Boutique", item: `${SITE_URL}/boutique` },
                { "@type": "ListItem", position: 3, name: seo.title, item: url },
              ],
            },
          ],
        }}
      />
      <CategoryView
        category={category}
        products={inCategory}
        categories={categories}
        title={seo.title}
        about={
          <section className="category-about" aria-label={seo.title}>
            <div lang="fr" dir="ltr"><h2>{seo.title}</h2><p>{seo.intro.fr}</p></div>
            <div lang="ary" dir="rtl"><h2>{seo.titleAry}</h2><p>{seo.intro.ary}</p></div>
          </section>
        }
      />
    </>
  );
}
