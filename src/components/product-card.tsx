"use client";

import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/catalog";
import { formatPrice, translateCategory, useStore } from "@/lib/storefront";

export function ProductCard({ product }: { product: Product }) {
  const { language, t } = useStore();
  const imageUrl = product.card_image_url ?? product.images[0]?.url;
  const bestOffer = [...(product.offers ?? [])].sort((a, b) => Number(a.unit_price) - Number(b.unit_price))[0];
  const href = `/produits/${encodeURIComponent(product.slug)}`;
  const isOnSale = product.sale_price !== null
    && Number(product.sale_price) < Number(product.price);

  return (
    <article className="product-card">
      <Link href={href} className="product-image-link" tabIndex={-1} aria-hidden="true">
        <div className="product-image">
          {imageUrl ? (
            <Image src={imageUrl} alt="" fill sizes="(max-width: 700px) 50vw, 280px" unoptimized />
          ) : (
            <span className="image-placeholder">{t("noImage")}</span>
          )}
          <div className="product-badges">
            {isOnSale ? <span className="badge badge-sale">{t("sale")}</span> : null}
            {product.is_new ? <span className="badge badge-new">{t("new")}</span> : null}
            {product.is_best_seller ? <span className="badge badge-best">{t("best")}</span> : null}
          </div>
        </div>
      </Link>
      <div className="product-card-copy">
        {product.categories[0] ? (
          <span className="product-category" dir="auto">
            {translateCategory(product.categories[0].slug, product.categories[0].name, language)}
          </span>
        ) : null}
        <h3 dir="auto">
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="product-price">
          <strong>{formatPrice(product.current_price, language)}</strong>
          {isOnSale ? <del>{formatPrice(product.price, language)}</del> : null}
        </div>
        {bestOffer ? (
          <p className="product-offer" dir="auto">
            <span>{bestOffer.badge || bestOffer.name}</span>
            {formatPrice(bestOffer.total, language)}
          </p>
        ) : null}
        <div className="card-actions">
          <Link className="button button-buy" href={href}>
            {product.variants.some((variant) => variant.available) ? t("buy") : t("unavailable")}
          </Link>
          {product.purchase_mode !== "checkout" ? (
            <AddToCartButton compact productId={product.id} productName={product.name} variants={product.variants} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
