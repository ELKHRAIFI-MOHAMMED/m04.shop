import Link from "next/link";
import type { Category } from "@/lib/catalog";
import { categoryPath, categorySeo } from "@/lib/seo";

/**
 * Written introduction to the shop, rendered on the server in French and Darija so
 * search engines read the words people type ("m04", "AirPods Maroc", "support PC"…),
 * with links to every category page.
 */
export function SeoAbout({ categories }: { categories: Category[] }) {
  const filled = categories.filter((category) => category.products_count > 0);
  return (
    <section className="content-section seo-about" aria-labelledby="seo-about-title">
      <div className="page-wrap seo-about-grid">
        <div lang="fr" dir="ltr">
          <p className="section-kicker">m04.shop · M04 Shop</p>
          <h2 id="seo-about-title">m04.shop, votre boutique d’accessoires tech au Maroc</h2>
          <p>
            m04.shop (M04 Shop) est une boutique en ligne marocaine d’accessoires high-tech : <strong>AirPods</strong>,{" "}
            <strong>écouteurs sans fil</strong> Bluetooth, <strong>chargeurs rapides</strong> pour iPhone et Samsung,{" "}
            <strong>power banks</strong>, <strong>supports PC portable</strong> et montres connectées.
          </p>
          <p>
            Tous les prix sont en dirhams. Vous commandez en quelques secondes, nous vous appelons pour confirmer, et vous payez
            seulement à la livraison, à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et dans toutes les villes du Maroc.
          </p>
        </div>
        <div lang="ary" dir="rtl">
          <p className="section-kicker">m04.shop</p>
          <h3>m04.shop، المتجر ديال إكسسوارات التكنولوجيا فالمغرب</h3>
          <p>
            فـ m04.shop غادي تلقا AirPods، سماعات بلا خيط، شواحن سريعة للآيفون والسامسونغ، باور بانك، حوامل الحاسوب
            والساعات الذكية، كلشي مختار بعناية وبثمن مزيان بالدرهم.
          </p>
          <p>
            كتطلب فثواني، كنعيطو ليك باش نأكدو الطلب، وما كتخلّص حتى توصلك السلعة، فكازا، الرباط، مراكش، طنجة، فاس، أكادير
            وجميع مدن المغرب.
          </p>
        </div>
        {filled.length ? (
          <nav className="seo-links" aria-label="Catégories" lang="fr" dir="ltr">
            {filled.map((category) => (
              <Link key={category.id} href={categoryPath(category.slug)}>{categorySeo(category.slug, category.name).title}</Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
