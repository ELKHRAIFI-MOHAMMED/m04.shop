import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SeoAbout } from "@/components/seo-about";
import { StorefrontHome } from "@/components/storefront-home";
import { BRAND_NAMES } from "@/lib/seo";
import { SITE_URL, getCatalog, getHome } from "@/lib/server-api";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [{ products, categories }, home] = await Promise.all([getCatalog(), getHome()]);
  const social = home?.social;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "OnlineStore",
              "@id": `${SITE_URL}/#store`,
              name: "m04.shop",
              alternateName: BRAND_NAMES.filter((name) => name !== "m04.shop"),
              url: SITE_URL,
              logo: `${SITE_URL}/icon.png`,
              image: `${SITE_URL}/og.jpg`,
              description: "m04.shop : accessoires tech au Maroc. AirPods, écouteurs sans fil, chargeurs rapides, power banks, supports PC et montres connectées, livrés partout au Maroc avec paiement à la livraison.",
              areaServed: { "@type": "Country", name: "Maroc" },
              address: { "@type": "PostalAddress", addressCountry: "MA" },
              currenciesAccepted: "MAD",
              paymentAccepted: "Cash",
              sameAs: [social?.instagram, social?.facebook, social?.tiktok].filter(Boolean),
              ...(social?.whatsapp
                ? { contactPoint: { "@type": "ContactPoint", telephone: `+${social.whatsapp}`, contactType: "customer service", areaServed: "MA", availableLanguage: ["fr", "ar"] } }
                : {}),
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: "m04.shop",
              alternateName: BRAND_NAMES.filter((name) => name !== "m04.shop"),
              url: SITE_URL,
              inLanguage: ["fr-MA", "ar-MA"],
              publisher: { "@id": `${SITE_URL}/#store` },
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/boutique?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <StorefrontHome initial={{ products, categories, home }} about={<SeoAbout categories={categories} />} />
    </>
  );
}
