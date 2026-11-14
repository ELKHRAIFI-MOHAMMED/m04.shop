"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon, ShoppingCartSimpleIcon } from "@phosphor-icons/react";
import { apiFetch } from "@/lib/api";
import { trackPixel } from "@/lib/pixel";
import { useStore } from "@/lib/storefront";

type Variant = { id: number; name: string; available: boolean };

export function AddToCartButton({
  productId,
  productName,
  variants,
  selectedVariantId,
  quantity = 1,
  value,
  showCartLink = false,
  compact = false,
}: {
  productId: number;
  productName?: string;
  variants: Variant[];
  selectedVariantId?: number;
  quantity?: number;
  value?: number;
  showCartLink?: boolean;
  /** Icon-only button (product cards). */
  compact?: boolean;
}) {
  const { t } = useStore();
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const variant = variants.find((item) => item.id === selectedVariantId && item.available)
    ?? variants.find((item) => item.available);

  // The compact icon shows a check for a moment, then becomes a cart again.
  useEffect(() => {
    if (!compact || !added) return;
    const timer = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(timer);
  }, [compact, added]);

  async function addToCart() {
    if (!variant) return;
    setPending(true);
    setMessage("");
    try {
      await apiFetch("/cart/" + productId, {
        method: "POST",
        body: JSON.stringify({ variant_id: variant.id, quantity }),
      });
      setMessage(t("added"));
      setAdded(true);
      window.dispatchEvent(new Event("m04-cart-updated"));
      trackPixel("AddToCart", {
        content_ids: [String(productId)],
        content_name: productName,
        content_type: "product",
        contents: [{ id: String(productId), quantity }],
        ...(value ? { value, currency: "MAD" } : {}),
      });
    } catch {
      setMessage(t("addError"));
    } finally {
      setPending(false);
    }
  }

  if (compact) {
    const label = !variant ? t("unavailable") : added ? t("added") : `${t("add")} · ${productName ?? ""}`.trim();
    return (
      <>
        <button
          type="button"
          onClick={addToCart}
          disabled={!variant || pending}
          className={`cart-icon-button${added ? " is-added" : ""}`}
          aria-label={label}
          title={label}
        >
          {added ? <CheckIcon size={20} weight="bold" aria-hidden="true" /> : <ShoppingCartSimpleIcon size={20} weight="bold" aria-hidden="true" />}
        </button>
        <span className="sr-only" role="status">{message}</span>
      </>
    );
  }

  return (
    <div className="add-to-cart">
      <button onClick={addToCart} disabled={!variant || pending} className="button button-add">
        {!variant ? t("unavailable") : pending ? t("adding") : t("add")}
      </button>
      {message ? <p role="status" className="add-to-cart-message">{message}</p> : null}
      {added && showCartLink ? <Link className="button button-ghost add-to-cart-next" href="/panier">{t("viewCart")}</Link> : null}
    </div>
  );
}
