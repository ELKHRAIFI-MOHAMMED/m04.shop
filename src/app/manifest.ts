import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "m04.shop – Accessoires tech au Maroc",
    short_name: "m04.shop",
    description: "AirPods, écouteurs sans fil, chargeurs, power banks et supports PC. Paiement à la livraison partout au Maroc.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "fr-MA",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
