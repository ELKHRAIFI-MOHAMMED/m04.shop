"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { CheckIcon, LightningIcon } from "@phosphor-icons/react";
import { apiFetch } from "@/lib/api";
import { trackPixel } from "@/lib/pixel";
import { formatPrice, useStore } from "@/lib/storefront";

type OrderResponse = {
  data: {
    reference: string;
    total: number;
    event_id: string;
    items: { item_id: string; item_name: string; quantity: number; price: number }[];
  };
};

function newRequestKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // RFC 4122 v4 shape for older browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Order form on the product page: one product, chosen colour and offer, no cart.
 * The request key is kept until the order succeeds, so a retry never creates a
 * second order.
 */
export function DirectCheckout({
  productId,
  productName,
  variantId,
  quantity,
  total,
  available,
}: {
  productId: number;
  productName: string;
  variantId?: number;
  quantity: number;
  total: number;
  available: boolean;
}) {
  const { language, t } = useStore();
  const [requestKey, setRequestKey] = useState(newRequestKey);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderResponse["data"] | null>(null);
  const started = useRef(false);

  function onStart() {
    if (started.current) return;
    started.current = true;
    trackPixel("InitiateCheckout", {
      value: total, currency: "MAD", num_items: quantity, content_ids: [String(productId)], content_type: "product",
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const details = Object.fromEntries([...form.entries()].filter(([, value]) => value !== ""));
    try {
      const order = await apiFetch<OrderResponse>("/orders/direct", {
        method: "POST",
        body: JSON.stringify({ ...details, product_id: productId, variant_id: variantId, quantity, request_key: requestKey }),
      });
      // Same event_id as the server-side Conversions API event, so Meta counts one purchase.
      trackPixel("Purchase", {
        value: order.data.total, currency: "MAD", content_type: "product",
        content_ids: order.data.items.map((item) => item.item_id),
        contents: order.data.items.map((item) => ({ id: item.item_id, quantity: item.quantity, item_price: item.price })),
        num_items: order.data.items.reduce((sum, item) => sum + item.quantity, 0),
      }, order.data.event_id);
      setConfirmation(order.data);
      setRequestKey(newRequestKey());
    } catch (requestError) {
      console.error(`Could not place the direct order for "${productName}".`, requestError);
      setError(true);
    } finally {
      setPending(false);
    }
  }

  if (confirmation) {
    return (
      <section className="direct-checkout direct-success" id="commander" role="status">
        <span className="confirmation-mark" aria-hidden="true"><CheckIcon size={26} weight="bold" /></span>
        <p className="section-kicker">{t("orderSent")}</p>
        <h2>{t("thankYou")}</h2>
        <p>{t("reference")} : <strong>{confirmation.reference}</strong></p>
        <p>{t("total")} : <strong>{formatPrice(confirmation.total, language)}</strong></p>
        <p className="direct-note">{t("phoneHint")}</p>
        <Link className="button button-ghost" href="/boutique">{t("continueShopping")}</Link>
      </section>
    );
  }

  return (
    <section className="direct-checkout" id="commander" aria-labelledby="direct-checkout-title">
      <div className="direct-head">
        <span className="direct-icon" aria-hidden="true"><LightningIcon size={20} weight="fill" /></span>
        <div>
          <h2 id="direct-checkout-title">{t("orderNow")}</h2>
          <p>{t("orderNowText")}</p>
        </div>
      </div>
      <form className="checkout-form" onSubmit={submit} onFocus={onStart}>
        <div className="direct-grid">
          <label>{t("fullName")}<input name="name" required maxLength={190} autoComplete="name" /></label>
          <label>{t("phone")}<input name="phone" type="tel" required maxLength={40} autoComplete="tel" dir="ltr" inputMode="tel" placeholder="06 00 00 00 00" /></label>
          <label>{t("city")}<input name="city" required maxLength={120} autoComplete="address-level2" /></label>
          <label>{t("address")}<input name="address" required maxLength={500} autoComplete="street-address" /></label>
        </div>
        <label>{t("deliveryNote")}<textarea name="comment" maxLength={500} rows={2} /></label>
        {/* Left empty by people; filled by spam bots. */}
        <label className="hp-field" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {error ? <p role="alert" className="form-error">{t("orderError")}</p> : null}
        <button className="button button-primary checkout-submit" disabled={pending || !available || !variantId}>
          {!available || !variantId ? t("unavailable") : pending ? t("processing") : `${t("orderButton")} · ${formatPrice(total, language)}`}
        </button>
        <p className="direct-note">{t("cod")} · {t("freeDelivery")}</p>
      </form>
    </section>
  );
}
