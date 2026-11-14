"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { MinusIcon, PlusIcon, ShoppingBagOpenIcon, TagIcon } from "@phosphor-icons/react";
import { OrderThanks, type PlacedOrder } from "@/components/order-thanks";
import { apiFetch } from "@/lib/api";
import { getProduct, type Product } from "@/lib/catalog";
import { trackPixel } from "@/lib/pixel";
import { formatPrice, useStore } from "@/lib/storefront";

type CartLine = {
  product_id: number;
  slug: string;
  name: string;
  image_url: string;
  variant_id: number;
  variant: string;
  quantity: number;
  unit_price: number;
  total: number;
  available: boolean;
};
/** Computed by the server with the same rule as the order: what the customer will pay. */
type CartSummary = { products: number; subtotal: number; discount: number; discount_per_product: number; shipping: number; total: number };
type CartResponse = { data: CartLine[]; summary?: CartSummary };
type CheckoutResponse = { request_key: string; shipping: number };
type OrderResponse = { data: PlacedOrder };
type ErrorKey = "cartLoadError" | "cartUpdateError" | "cartRemoveError" | "orderError" | "lineError";

export default function CartPage() {
  const { language, t } = useStore();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [confirmation, setConfirmation] = useState<OrderResponse["data"] | null>(null);
  const [summary, setSummary] = useState<CartSummary | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<CartResponse>("/cart")
      .then((result) => {
        if (!active) return;
        setCart(result.data);
        setSummary(result.summary ?? null);
        setError(null);
      })
      .catch((requestError: unknown) => {
        console.error("Could not load the m04.shop cart.", requestError);
        if (active) setError("cartLoadError");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Product details give each line its colours and quantity offers.
  useEffect(() => {
    const missing = cart.map((line) => line.slug).filter((slug) => slug && !products[slug]);
    if (!missing.length) return;
    let active = true;
    Promise.all(missing.map((slug) => getProduct(slug).catch(() => null))).then((loaded) => {
      if (!active) return;
      setProducts((current) => {
        const next = { ...current };
        loaded.forEach((product) => {
          if (product) next[product.slug] = product;
        });
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [cart, products]);

  async function update(line: CartLine, changes: { quantity?: number; variant_id?: number }) {
    setPending(true);
    setError(null);
    try {
      const result = await apiFetch<CartResponse>(`/cart/${line.product_id}`, {
        method: "PATCH",
        body: JSON.stringify({ variant_id: changes.variant_id ?? line.variant_id, quantity: changes.quantity ?? line.quantity }),
      });
      setCart(result.data);
      setSummary(result.summary ?? null);
      window.dispatchEvent(new Event("m04-cart-updated"));
    } catch (requestError) {
      console.error("Could not update the m04.shop cart.", requestError);
      setError(changes.variant_id ? "lineError" : "cartUpdateError");
    } finally {
      setPending(false);
    }
  }

  async function remove(line: CartLine) {
    setPending(true);
    setError(null);
    try {
      const result = await apiFetch<CartResponse>(`/cart/${line.product_id}`, { method: "DELETE" });
      setCart(result.data);
      setSummary(result.summary ?? null);
      window.dispatchEvent(new Event("m04-cart-updated"));
    } catch (requestError) {
      console.error("Could not remove an item from the m04.shop cart.", requestError);
      setError("cartRemoveError");
    } finally {
      setPending(false);
    }
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const details = Object.fromEntries([...form.entries()].filter(([, value]) => value !== ""));
    trackPixel("InitiateCheckout", {
      value: total, currency: "MAD", num_items: cart.reduce((sum, line) => sum + line.quantity, 0),
      content_ids: cart.map((line) => String(line.product_id)), content_type: "product",
    });
    try {
      const checkout = await apiFetch<CheckoutResponse>("/cart/checkout", { method: "POST", body: "{}" });
      const order = await apiFetch<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify({ ...details, request_key: checkout.request_key }),
      });
      // Same event_id as the server-side Conversions API event, so Meta counts one purchase.
      trackPixel("Purchase", {
        value: order.data.total, currency: "MAD", content_type: "product",
        content_ids: order.data.items.map((item) => item.item_id),
        contents: order.data.items.map((item) => ({ id: item.item_id, quantity: item.quantity, item_price: item.price })),
        num_items: order.data.items.reduce((sum, item) => sum + item.quantity, 0),
      }, order.data.event_id);
      setConfirmation(order.data);
      setCart([]);
      setSummary(null);
      window.scrollTo({ top: 0 });
      window.dispatchEvent(new Event("m04-cart-updated"));
    } catch (requestError) {
      console.error("Could not place the m04.shop order.", requestError);
      setError("orderError");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <main className="page-wrap cart-page"><p className="state-message" role="status">{t("loading")}</p></main>;
  if (confirmation) {
    return (
      <main className="page-wrap confirmation-page">
        <OrderThanks order={confirmation} as="page" />
      </main>
    );
  }

  const subtotal = summary?.subtotal ?? cart.reduce((sum, line) => sum + Number(line.total), 0);
  const discount = summary?.discount ?? 0;
  const shipping = summary?.shipping ?? 0;
  const total = summary?.total ?? subtotal;
  const perProduct = summary?.discount_per_product ?? 29;

  return (
    <main className="page-wrap cart-page">
      <div className="breadcrumb"><Link href="/">{t("home")}</Link><span aria-hidden="true">/</span><span>{t("cartTitle")}</span></div>
      <div className="cart-layout">
        <section>
          <div className="cart-heading">
            <h1>{t("cartTitle")}</h1>
            <Link className="text-link" href="/boutique">{t("continueShopping")}</Link>
          </div>
          {error ? <p role="alert" className="form-error">{t(error)}</p> : null}
          {cart.length ? (
            <p className="cart-offer-banner" role="note">
              <TagIcon size={20} weight="fill" aria-hidden="true" />
              <span>
                <strong>{t("cartOfferTitle").replace("{amount}", formatPrice(perProduct, language))}</strong>
                {discount > 0
                  ? t("cartOfferSaved").replace("{amount}", formatPrice(discount, language))
                  : t("cartOfferHint").replace("{amount}", formatPrice(perProduct, language))}
              </span>
            </p>
          ) : null}
          {cart.length ? (
            <div className="cart-lines">
              {cart.map((line) => {
                const product = products[line.slug];
                const offers = [...(product?.offers ?? [])].sort((a, b) => a.quantity - b.quantity);
                const colors = product?.variants.filter((variant) => variant.color_hex) ?? [];
                const offer = offers.find((item) => item.quantity === line.quantity);
                return (
                  <article key={`${line.product_id}-${line.variant_id}`} className="cart-line">
                    <Image src={line.image_url} alt={line.name} width={96} height={96} sizes="96px" unoptimized />
                    <div className="cart-line-copy">
                      <h2 dir="auto">{line.name}</h2>
                      <p dir="auto">{line.variant}{offer ? ` · ${t("offerLabel")} : ${offer.name}` : ""}</p>
                      <strong>{formatPrice(line.total, language)}</strong>
                      {!line.available ? <p className="line-warning">{t("unavailable")}</p> : null}

                      {colors.length > 1 ? (
                        <div className="line-colors" role="group" aria-label={t("color")}>
                          {colors.map((variant) => (
                            <button
                              key={variant.id}
                              type="button"
                              className={variant.id === line.variant_id ? "color-option small is-selected" : "color-option small"}
                              style={{ background: variant.color_hex ?? undefined }}
                              disabled={pending || !variant.available}
                              aria-pressed={variant.id === line.variant_id}
                              aria-label={variant.name}
                              title={variant.name}
                              onClick={() => void update(line, { variant_id: variant.id })}
                            />
                          ))}
                        </div>
                      ) : null}
                      {offers.length ? (
                        <div className="line-offers" role="group" aria-label={t("chooseOffer")}>
                          <button type="button" className={line.quantity === 1 ? "offer-chip is-selected" : "offer-chip"} disabled={pending} onClick={() => void update(line, { quantity: 1 })}>
                            {t("onePiece")}
                          </button>
                          {offers.map((item) => (
                            <button key={item.id} type="button" className={line.quantity === item.quantity ? "offer-chip is-selected" : "offer-chip"} disabled={pending} onClick={() => void update(line, { quantity: item.quantity })}>
                              {item.name} · {formatPrice(item.total, language)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="cart-line-actions">
                      <div className="quantity-control">
                        <button disabled={pending || line.quantity <= 1} onClick={() => void update(line, { quantity: line.quantity - 1 })} aria-label={t("decreaseQuantity")}><MinusIcon size={14} aria-hidden="true" /></button>
                        <span>{line.quantity}</span>
                        <button disabled={pending || line.quantity >= 20} onClick={() => void update(line, { quantity: line.quantity + 1 })} aria-label={t("increaseQuantity")}><PlusIcon size={14} aria-hidden="true" /></button>
                      </div>
                      <button className="remove-button" disabled={pending} onClick={() => void remove(line)}>{t("remove")}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-cart">
              <ShoppingBagOpenIcon size={40} aria-hidden="true" />
              <p>{t("emptyCart")}</p>
              <Link className="button button-primary" href="/boutique">{t("discover")}</Link>
            </div>
          )}
        </section>

        <aside className="checkout-card">
          <h2>{t("deliveryOrder")}</h2>
          {cart.length ? (
            <ul className="checkout-summary" aria-label={t("yourOrder")}>
              {cart.map((line) => (
                <li key={line.product_id}>
                  <span dir="auto">{line.name}<small dir="auto">{line.variant} × {line.quantity}</small></span>
                  <b>{formatPrice(line.total, language)}</b>
                </li>
              ))}
            </ul>
          ) : null}
          {discount > 0 || shipping > 0 ? (
            <dl className="cart-totals">
              <div><dt>{t("subtotal")}</dt><dd>{formatPrice(subtotal, language)}</dd></div>
              {discount > 0 ? (
                <div className="cart-discount">
                  <dt>{t("cartOfferLine").replace("{amount}", formatPrice(perProduct, language))}</dt>
                  <dd>− {formatPrice(discount, language)}</dd>
                </div>
              ) : null}
              {shipping > 0 ? <div><dt>{t("deliveryFee")}</dt><dd>{formatPrice(shipping, language)}</dd></div> : null}
            </dl>
          ) : null}
          <div className="subtotal-row"><span>{t("total")}</span><strong>{formatPrice(total, language)}</strong></div>
          <p className="checkout-note">{t("cod")}. {t("freeDelivery")}.</p>
          <form onSubmit={placeOrder} className="checkout-form">
            <p className="checkout-form-title">{t("deliveryDetails")}</p>
            <label>{t("fullName")}<input name="name" required maxLength={190} autoComplete="name" /></label>
            <label>{t("phone")}<input name="phone" type="tel" required maxLength={40} autoComplete="tel" dir="ltr" inputMode="tel" /><small>{t("phoneHint")}</small></label>
            <label>{t("city")}<input name="city" required maxLength={120} autoComplete="address-level2" /></label>
            <label>{t("district")}<input name="district" maxLength={120} autoComplete="address-level3" /></label>
            <label>{t("address")}<input name="address" required maxLength={500} autoComplete="street-address" /></label>
            <label>{t("deliveryNote")}<textarea name="comment" maxLength={500} rows={3} /></label>
            <button disabled={!cart.length || pending || cart.some((line) => !line.available)} className="button button-primary checkout-submit">
              {pending ? t("processing") : `${t("confirmOrder")} · ${formatPrice(total, language)}`}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
