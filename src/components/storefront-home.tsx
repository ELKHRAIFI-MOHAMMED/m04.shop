"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon, CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { HomeHero, KeywordMarquee } from "@/components/home-hero";
import { HomeSlider } from "@/components/home-slider";
import { ProductCard } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, type Category, type Product } from "@/lib/catalog";
import { getAllProducts, getHomeContent, type HomeContent } from "@/lib/content";
import { categoryPath } from "@/lib/seo";
import { translateCategory, useStore } from "@/lib/storefront";

const PAGE_SIZE = 24;

export type HomeInitialData = { products: Product[]; categories: Category[]; home: HomeContent | null };

/** `about` is the server-rendered search text block, shown near the end of the page. */
export function StorefrontHome({ initial, about }: { initial?: HomeInitialData; about?: ReactNode }) {
  const { language, t } = useStore();
  const ready = !!initial?.home && initial.products.length > 0;
  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [categories, setCategories] = useState<Category[]>(initial?.categories ?? []);
  const [home, setHome] = useState<HomeContent | null>(initial?.home ?? null);
  const [loading, setLoading] = useState(!ready);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (ready) return;
    let active = true;
    Promise.all([getAllProducts(), getCategories(), getHomeContent()])
      .then(([nextProducts, nextCategories, nextHome]) => {
        if (!active) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setHome(nextHome);
      })
      .catch((error: unknown) => {
        console.error("Could not load the m04.shop home page.", error);
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready]);

  const offers = useMemo(
    () => products.filter((product) => (product.offers?.length ?? 0) > 0 || (product.sale_price !== null && Number(product.sale_price) < Number(product.price))),
    [products],
  );
  const bestSellers = useMemo(() => products.filter((product) => product.is_best_seller), [products]);
  // Categories chosen for the home page in the admin; empty categories are never shown.
  const homeCategories = useMemo(() => {
    const filled = categories.filter((category) => category.products_count > 0);
    const chosen = filled.filter((category) => category.homepage_visible);
    if (chosen.length >= 2) return chosen;
    return [...chosen, ...filled.filter((category) => !category.homepage_visible)];
  }, [categories]);
  // Hero cards: products marked "Mis en avant" in the admin, else best sellers, else the newest.
  const showcase = useMemo(() => {
    const withImage = (list: Product[]) => list.filter((product) => product.card_image_url || product.images[0]);
    const featured = withImage(products.filter((product) => product.featured));
    if (featured.length) return featured;
    const best = withImage(bestSellers);
    return best.length ? best : withImage(products);
  }, [products, bestSellers]);
  const sections = home?.sections;
  const reviewsTitle = sections ? (language === "ary" ? sections.reviews_title_ary : sections.reviews_title_fr) : "";
  const reviewsText = sections ? (language === "ary" ? sections.reviews_text_ary : sections.reviews_text_fr) : "";

  return (
    <main>
      <HomeHero products={showcase} />
      <KeywordMarquee categories={categories} />

      {loading ? <div className="page-wrap"><p className="state-message" role="status">{t("loading")}</p></div> : null}
      {failed ? <div className="page-wrap"><p className="state-message state-error" role="alert">{t("loadError")}</p></div> : null}

      {home?.slides.length ? (
        <section className="promo-banner" aria-label="m04.shop">
          <div className="page-wrap">
            <HomeSlider slides={home.slides} autoplay={sections?.autoplay ?? true} />
          </div>
        </section>
      ) : null}

      {sections?.show_offers && offers.length ? (
        <section className="content-section offers-section" id="nouveautes">
          <div className="page-wrap">
            <SectionHeading title={t("offersTitle")} text={t("offersText")} />
            <ProductRail products={offers} />
          </div>
        </section>
      ) : null}

      {sections?.show_categories && homeCategories.length ? (
        <section className="content-section category-section" id="categories">
          <div className="page-wrap">
            <SectionHeading title={t("exploreCategories")} text={t("exploreText")} />
            <div className="cat-grid">
              {homeCategories.map((category) => (
                <Link className="cat-card" href={categoryPath(category.slug)} key={category.id}>
                  <span className="cat-card-image">
                    {category.image_url ? <Image src={category.image_url} alt="" fill sizes="(max-width: 760px) 45vw, 240px" unoptimized /> : <span className="cat-card-letter" aria-hidden="true">{category.name.slice(0, 1)}</span>}
                  </span>
                  <span className="cat-card-copy">
                    <span>
                      <strong dir="auto">{translateCategory(category.slug, category.name, language)}</strong>
                      <small>{category.products_count} {t("productsCount")}</small>
                    </span>
                    <span className="cat-card-arrow" aria-hidden="true"><ArrowRightIcon size={16} weight="bold" /></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections?.show_best_sellers && bestSellers.length ? (
        <section className="content-section">
          <div className="page-wrap">
            <SectionHeading title={t("bestTitle")} text={t("bestText")} />
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section className="content-section products-section" id="produits">
          <div className="page-wrap">
            <SectionHeading title={t("allTitle")} text={`${products.length} ${t("productsFound")}`} />
            <ProductGrid products={products.slice(0, visible)} />
            {visible < products.length ? (
              <div className="show-more">
                <button type="button" className="button button-ghost" onClick={() => setVisible(visible + PAGE_SIZE)}>{t("showMore")}</button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      {!loading && !failed && !products.length ? <div className="page-wrap"><p className="state-message">{t("emptyProduct")}</p></div> : null}

      {sections?.show_reviews && home?.reviews.length ? (
        <section className="content-section reviews-section" aria-labelledby="reviews-title">
          <div className="page-wrap">
            <SectionHeading id="reviews-title" title={reviewsTitle} text={reviewsText} />
            <ReviewCarousel images={home.reviews} />
          </div>
        </section>
      ) : null}

      {about}
    </main>
  );
}

function SectionHeading({ title, text, id }: { title: string; text?: string; id?: string }) {
  return (
    <div className="section-heading">
      <div>
        <h2 id={id}>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
    </div>
  );
}

/** Horizontal, snap-scrolling row of product cards with arrow buttons. */
function ProductRail({ products }: { products: Product[] }) {
  const { language, t } = useStore();
  const rail = useRef<HTMLDivElement>(null);
  const rtl = language === "ary";
  const scroll = (direction: 1 | -1) => {
    const node = rail.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85 * (rtl ? -1 : 1), behavior: "smooth" });
  };
  return (
    <div className="rail-wrap">
      <div className="rail" ref={rail}>
        {products.map((product) => (
          <div className="rail-item" key={product.id}><ProductCard product={product} /></div>
        ))}
      </div>
      {products.length > 2 ? (
        <div className="rail-controls">
          <button type="button" className="rail-button" onClick={() => scroll(-1)} aria-label={t("previous")}>{rtl ? <CaretRightIcon size={18} /> : <CaretLeftIcon size={18} />}</button>
          <button type="button" className="rail-button" onClick={() => scroll(1)} aria-label={t("next")}>{rtl ? <CaretLeftIcon size={18} /> : <CaretRightIcon size={18} />}</button>
        </div>
      ) : null}
    </div>
  );
}

/** Customer screenshots in a scrolling strip; a click opens the image full size. */
function ReviewCarousel({ images }: { images: HomeContent["reviews"] }) {
  const { language, t } = useStore();
  const rail = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const rtl = language === "ary";

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open !== null && !node.open) node.showModal();
    if (open === null && node.open) node.close();
  }, [open]);

  const scroll = (direction: 1 | -1) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * 0.8 * (rtl ? -1 : 1), behavior: "smooth" });
  const step = (delta: number) => setOpen((current) => (current === null ? null : (current + delta + images.length) % images.length));

  return (
    <div className="rail-wrap">
      <div className="rail review-rail" ref={rail}>
        {images.map((image, index) => (
          <button type="button" className="review-shot" key={image.url} onClick={() => setOpen(index)} aria-label={`${t("reviewImage")} ${index + 1}`}>
            <Image src={image.url} alt="" width={image.width} height={image.height} sizes="220px" unoptimized />
          </button>
        ))}
      </div>
      <div className="rail-controls">
        <button type="button" className="rail-button" onClick={() => scroll(-1)} aria-label={t("previous")}>{rtl ? <CaretRightIcon size={18} /> : <CaretLeftIcon size={18} />}</button>
        <button type="button" className="rail-button" onClick={() => scroll(1)} aria-label={t("next")}>{rtl ? <CaretLeftIcon size={18} /> : <CaretRightIcon size={18} />}</button>
      </div>

      <dialog
        ref={dialog}
        className="lightbox"
        onClose={() => setOpen(null)}
        onClick={(event) => event.target === dialog.current && setOpen(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(rtl ? -1 : 1);
          if (event.key === "ArrowLeft") step(rtl ? 1 : -1);
        }}
      >
        {open !== null ? (
          <div className="lightbox-frame">
            <Image src={images[open].url} alt={`${t("reviewImage")} ${open + 1}`} width={images[open].width} height={images[open].height} unoptimized />
            <button type="button" className="lightbox-close" onClick={() => setOpen(null)} aria-label={t("close")}><XIcon size={20} /></button>
            <button type="button" className="lightbox-nav lightbox-prev" onClick={() => step(-1)} aria-label={t("previous")}><CaretLeftIcon size={22} /></button>
            <button type="button" className="lightbox-nav lightbox-next" onClick={() => step(1)} aria-label={t("next")}><CaretRightIcon size={22} /></button>
            <span className="lightbox-count">{open + 1} / {images.length}</span>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
