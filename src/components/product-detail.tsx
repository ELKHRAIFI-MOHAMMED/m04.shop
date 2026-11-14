"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckCircleIcon, HandCoinsIcon, TruckIcon } from "@phosphor-icons/react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { DirectCheckout } from "@/components/direct-checkout";
import { Tilt } from "@/components/tilt";
import { ProductLanding } from "@/components/product-landing";
import { VariantPicker } from "@/components/variant-picker";
import { getProduct, isReadableDescription, type Product } from "@/lib/catalog";
import { trackPixel } from "@/lib/pixel";
import { categoryPath } from "@/lib/seo";
import { formatPrice, translateCategory, useStore } from "@/lib/storefront";

export function ProductDetail({ slug, initialProduct }: { slug: string; initialProduct?: Product | null }) {
  const { language, t } = useStore();
  const [result, setResult] = useState<{ slug: string; product: Product | null; failed: boolean } | null>(
    initialProduct !== undefined ? { slug, product: initialProduct, failed: false } : null,
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(initialProduct?.variants.find((variant) => variant.available)?.id);
  const [quantity, setQuantity] = useState(1);
  // An image linked to the chosen colour or offer replaces the gallery image.
  const [linkedImage, setLinkedImage] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct !== undefined) {
      if (initialProduct) {
        trackPixel("ViewContent", {
          content_ids: [String(initialProduct.id)], content_name: initialProduct.name, content_type: "product",
          value: Number(initialProduct.current_price), currency: "MAD",
        });
      }
      return;
    }
    let active = true;
    getProduct(slug)
      .then((result) => {
        if (!active) return;
        setResult({ slug, product: result, failed: false });
        setSelectedImage(0);
        setQuantity(1);
        setLinkedImage(null);
        const firstVariant = result?.variants.find((variant) => variant.available);
        setSelectedVariantId(firstVariant?.id);
        if (result) {
          trackPixel("ViewContent", {
            content_ids: [String(result.id)], content_name: result.name, content_type: "product",
            value: Number(result.current_price), currency: "MAD",
          });
        }
      })
      .catch((error: unknown) => {
        console.error(`Could not load product "${slug}".`, error);
        if (active) setResult({ slug, product: null, failed: true });
      });
    return () => {
      active = false;
    };
  }, [slug, initialProduct]);

  const loading = result?.slug !== slug;
  const product = result?.slug === slug ? result.product : null;
  const failed = result?.slug === slug && result.failed;

  if (loading) return <main className="page-wrap"><p className="state-message" role="status">{t("loading")}</p></main>;
  if (failed || !product) {
    return <main className="page-wrap"><p className="state-message state-error" role="alert">{failed ? t("loadError") : t("productNotFound")}</p><Link className="text-link" href="/boutique">{t("back")}</Link></main>;
  }

  const image = linkedImage ? { url: linkedImage, alt: product.name } : product.images[selectedImage];
  const isOnSale = product.sale_price !== null && Number(product.sale_price) < Number(product.price);
  const offers = [...(product.offers ?? [])].sort((a, b) => a.quantity - b.quantity);
  const variant = product.variants.find((item) => item.id === selectedVariantId);
  const unitPrice = Number(variant?.price ?? product.current_price);
  const chosenOffer = offers.find((offer) => offer.quantity === quantity);
  const total = chosenOffer ? Number(chosenOffer.total) : unitPrice * quantity;
  const mode = product.purchase_mode ?? "cart";
  const directOrder = mode === "checkout" || mode === "both";

  return (
    <main className="page-wrap product-page">
      <div className="breadcrumb">
        <Link href="/">{t("home")}</Link><span aria-hidden="true">/</span>
        {product.categories[0]
          ? <Link href={categoryPath(product.categories[0].slug)} dir="auto">{translateCategory(product.categories[0].slug, product.categories[0].name, language)}</Link>
          : <Link href="/boutique">{t("shop")}</Link>}
        <span aria-hidden="true">/</span><span dir="auto">{product.name}</span>
      </div>
      <div className="product-detail-layout">
        <section className="product-gallery" aria-label={t("productGallery")}>
          <Tilt className="product-main-image" max={5}>
            {image ? <Image src={image.url} alt={image.alt ?? product.name} fill sizes="(max-width: 700px) 100vw, 55vw" unoptimized loading="eager" /> : <span className="image-placeholder">{t("noImage")}</span>}
            {isOnSale ? <span className="badge badge-sale">{t("sale")}</span> : null}
          </Tilt>
          {product.images.length > 1 ? (
            <div className="product-thumbnails">
              {product.images.map((item, index) => (
                <button className={!linkedImage && selectedImage === index ? "is-selected" : ""} type="button" key={item.url} onClick={() => { setSelectedImage(index); setLinkedImage(null); }} aria-label={`${t("productGallery")} ${index + 1}`}>
                  <Image src={item.url} alt="" fill sizes="74px" unoptimized />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="product-information" id="acheter">
          <Link className="text-link product-back" href="/boutique">{t("back")}</Link>
          {product.categories[0] ? <Link className="section-kicker" href={categoryPath(product.categories[0].slug)}>{translateCategory(product.categories[0].slug, product.categories[0].name, language)}</Link> : null}
          <h1 dir="auto">{product.name}</h1>
          <div className="product-detail-price">
            <strong>{formatPrice(product.current_price, language)}</strong>
            {isOnSale ? <del>{formatPrice(product.price, language)}</del> : null}
            {product.is_new ? <span className="badge badge-new">{t("new")}</span> : null}
            {product.is_best_seller ? <span className="badge badge-best">{t("best")}</span> : null}
          </div>
          {isReadableDescription(product.description) ? <div className="product-description" dir="auto"><h2>{t("description")}</h2><p>{product.description}</p></div> : null}

          {offers.length ? (
            <fieldset className="offer-picker">
              <legend>{t("chooseOffer")}</legend>
              <div className="offer-options" role="radiogroup">
                <OfferOption checked={quantity === 1} title={t("onePiece")} price={formatPrice(unitPrice, language)} onSelect={() => { setQuantity(1); setLinkedImage(variant?.image_url ?? null); }} />
                {offers.map((offer) => {
                  const regular = unitPrice * offer.quantity;
                  const saving = regular > Number(offer.total) ? Math.round((1 - Number(offer.total) / regular) * 100) : 0;
                  return (
                    <OfferOption
                      key={offer.id}
                      checked={quantity === offer.quantity}
                      title={offer.name}
                      badge={offer.badge}
                      note={`${formatPrice(offer.unit_price, language)} ${t("perUnit")}${saving ? ` · ${t("saveLabel")} ${saving}%` : ""}`}
                      price={formatPrice(offer.total, language)}
                      onSelect={() => { setQuantity(offer.quantity); if (offer.image_url) setLinkedImage(offer.image_url); }}
                    />
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {product.variants.length ? (
            <VariantPicker
              product={product}
              selected={variant}
              onSelect={(item) => { setSelectedVariantId(item.id); if (item.image_url) setLinkedImage(item.image_url); }}
            />
          ) : null}
          {offers.length ? <p className="order-total"><span>{t("total")}</span><strong>{formatPrice(total, language)}</strong></p> : null}
          {directOrder ? (
            <DirectCheckout
              productId={product.id}
              productName={product.name}
              variantId={variant?.available ? variant.id : product.variants.find((item) => item.available)?.id}
              quantity={quantity}
              total={total}
              available={product.variants.some((item) => item.available)}
            />
          ) : null}
          {mode === "both" ? <p className="purchase-or"><span>{t("or")}</span></p> : null}
          {mode !== "checkout" ? (
            <div className={mode === "both" ? "cart-secondary" : undefined}>
              <AddToCartButton productId={product.id} productName={product.name} variants={product.variants} selectedVariantId={selectedVariantId} quantity={quantity} value={total} showCartLink />
            </div>
          ) : null}
          <ul className="product-promise">
            <li><HandCoinsIcon size={18} aria-hidden="true" />{t("cod")}</li>
            <li><TruckIcon size={18} aria-hidden="true" />{t("freeDelivery")}</li>
            <li><CheckCircleIcon size={18} aria-hidden="true" />{t("support")}</li>
          </ul>
        </section>
      </div>
      <ProductLanding sections={product.sections ?? []} orderHref={directOrder ? "#commander" : "#acheter"} productName={product.name} />
      {directOrder ? <StickyOrderBar label={`${t("orderButton")} · ${formatPrice(total, language)}`} /> : null}
    </main>
  );
}

/** Phone-size shortcut to the order form, hidden while the form is on screen. */
function StickyOrderBar({ label }: { label: string }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const form = document.getElementById("commander");
    if (!form) return;
    // Shown once the visitor has scrolled down and the form is out of view.
    const update = () => {
      const rect = form.getBoundingClientRect();
      setHidden(window.scrollY < 240 || (rect.top < window.innerHeight && rect.bottom > 0));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="sticky-order" data-hidden={hidden ? "" : undefined}>
      <a className="button button-primary" href="#commander" tabIndex={hidden ? -1 : undefined}>{label}</a>
    </div>
  );
}

function OfferOption({ checked, title, badge, note, price, onSelect }: { checked: boolean; title: string; badge?: string | null; note?: string; price: string; onSelect: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={checked} className={checked ? "offer-option is-selected" : "offer-option"} onClick={onSelect}>
      <span className="offer-radio" aria-hidden="true" />
      <span className="offer-copy">
        <strong dir="auto">{title}{badge ? <em dir="auto">{badge}</em> : null}</strong>
        {note ? <small>{note}</small> : null}
      </span>
      <b>{price}</b>
    </button>
  );
}
