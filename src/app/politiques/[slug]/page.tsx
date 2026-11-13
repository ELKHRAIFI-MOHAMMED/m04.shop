import type { Metadata } from "next";
import { Suspense } from "react";
import { PolicyView } from "@/components/policy-view";
import { getPolicies, getPolicy } from "@/lib/server-api";

export async function generateStaticParams() {
  const pages = await getPolicies();
  return pages.length ? pages.map((page) => ({ slug: page.slug })) : [{ slug: "livraison" }];
}

export async function generateMetadata({ params }: PageProps<"/politiques/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPolicy(slug);
  if (!page) return { title: "Page introuvable", robots: { index: false } };
  return { title: page.title.fr, description: `${page.title.fr} de m04.shop : paiement à la livraison, livraison partout au Maroc.`, alternates: { canonical: `/politiques/${slug}` } };
}

export default function PolicyPage({ params }: PageProps<"/politiques/[slug]">) {
  return (
    <Suspense fallback={<main className="page-wrap"><p className="state-message">…</p></main>}>
      <PolicyContent params={params} />
    </Suspense>
  );
}

async function PolicyContent({ params }: { params: PageProps<"/politiques/[slug]">["params"] }) {
  const { slug } = await params;
  const [page, links] = await Promise.all([getPolicy(slug), getPolicies()]);
  return <PolicyView slug={slug} initialPage={page} initialLinks={links} />;
}
