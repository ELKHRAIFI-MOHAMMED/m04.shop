import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { getCatalog } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Boutique : tous nos accessoires tech",
  description: "Écouteurs, power banks, chargeurs, supports PC et montres : tout le catalogue m04.shop, livré partout au Maroc avec paiement à la livraison.",
  alternates: { canonical: "/boutique" },
};

export default async function CatalogPage() {
  const catalog = await getCatalog();
  return (
    <Suspense fallback={<main className="page-wrap"><p className="state-message">…</p></main>}>
      <CatalogBrowser initial={catalog} />
    </Suspense>
  );
}
