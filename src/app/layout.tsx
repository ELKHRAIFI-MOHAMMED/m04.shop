import type { Metadata, Viewport } from "next";
import { Readex_Pro } from "next/font/google";
import { MetaPixel } from "@/components/meta-pixel";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StoreShell } from "@/components/store-shell";
import { SITE_KEYWORDS } from "@/lib/seo";
import { SITE_URL, getTracking } from "@/lib/server-api";
import { StoreProvider } from "@/lib/storefront";
import "lenis/dist/lenis.css";
import "./globals.css";

const readex = Readex_Pro({
  subsets: ["latin", "arabic"],
  variable: "--font-readex",
  display: "swap",
});

const DESCRIPTION =
  "m04.shop (M04 Shop) : accessoires tech au Maroc. AirPods, écouteurs sans fil, chargeurs rapides, power banks, supports PC portable et montres connectées. Paiement à la livraison, livraison partout au Maroc.";
const TITLE = "m04.shop – M04 Shop Maroc | AirPods, écouteurs sans fil, chargeurs, supports PC";

export async function generateMetadata(): Promise<Metadata> {
  const tracking = await getTracking();
  // Search engine ownership tags, set on the hosting (Google Search Console, Bing Webmaster Tools).
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  const other: Record<string, string> = {};
  if (tracking?.domain_verification) other["facebook-domain-verification"] = tracking.domain_verification;
  if (bing) other["msvalidate.01"] = bing;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE, template: "%s | m04.shop" },
    description: DESCRIPTION,
    applicationName: "m04.shop",
    keywords: SITE_KEYWORDS,
    authors: [{ name: "m04.shop", url: SITE_URL }],
    creator: "m04.shop",
    publisher: "m04.shop",
    category: "shopping",
    openGraph: {
      type: "website",
      siteName: "m04.shop",
      title: TITLE,
      description: DESCRIPTION,
      url: SITE_URL,
      locale: "fr_MA",
      alternateLocale: ["ar_MA"],
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "m04.shop, accessoires tech au Maroc" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.jpg"] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    formatDetection: { telephone: false },
    ...(google ? { verification: { google } } : {}),
    ...(Object.keys(other).length ? { other } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
};

// Applies the saved theme and language direction before the first paint.
const preferencesScript = `(function(){try{var d=document.documentElement;if(localStorage.getItem("m04-theme")==="light"){d.classList.remove("dark");d.classList.add("light")}if(localStorage.getItem("m04-language")==="fr"){d.lang="fr";d.dir="ltr"}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ary" dir="rtl" className={`${readex.variable} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <MetaPixel />
          <SmoothScroll>
            <StoreShell>{children}</StoreShell>
          </SmoothScroll>
        </StoreProvider>
      </body>
    </html>
  );
}
