"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { getHomeContent, whatsappLink } from "@/lib/content";
import { trackPixel } from "@/lib/pixel";
import { formatPrice, useStore, type Language } from "@/lib/storefront";

/** What the API returns once an order is saved (direct form or cart). */
export type PlacedOrder = {
  reference: string;
  total: number;
  shipping?: number;
  event_id: string;
  customer?: { name: string; phone: string; city: string; address: string; comment: string | null };
  items: { item_id: string; item_name: string; quantity: number; price: number; total?: number }[];
};

const SHOP_WHATSAPP = "212620638999";

const COPY = {
  fr: {
    kicker: "Commande reçue",
    title: "Merci pour votre confiance !",
    hello: (name: string) => `Merci ${name}, votre commande est bien enregistrée.`,
    lead: "Merci, votre commande est bien enregistrée.",
    reference: "N° de commande",
    total: "Total à payer à la livraison",
    shipping: "Livraison",
    free: "Offerte",
    deliverTo: "Livraison à",
    confirmTitle: "Confirmez en un clic sur WhatsApp",
    confirmText: "Envoyez-nous le récapitulatif de votre commande : elle sera confirmée plus vite. Sinon, nous vous appelons avant l’envoi.",
    button: "Confirmer sur WhatsApp",
    continue: "Continuer mes achats",
  },
  ary: {
    kicker: "الطلب وصلنا",
    title: "شكراً على الثقة ديالك!",
    hello: (name: string) => `شكراً ${name}، الطلب ديالك تسجل مزيان.`,
    lead: "شكراً، الطلب ديالك تسجل مزيان.",
    reference: "رقم الطلب",
    total: "المجموع اللي غادي تخلص ملي توصلك",
    shipping: "التوصيل",
    free: "فابور",
    deliverTo: "التوصيل لـ",
    confirmTitle: "أكد الطلب ديالك فالواتساب بكليكة وحدة",
    confirmText: "صيفط لينا الملخص ديال الطلب باش نأكدوه بزربة. وإلا ما صيفطتيش، غادي نعيطو ليك قبل ما نصيفطو.",
    button: "أكد فالواتساب",
    continue: "كمل التقدية",
  },
} as const;

const money = (value: number) => `${Number(value).toLocaleString("fr-MA", { maximumFractionDigits: 2 })} DH`;

/** Ready-to-send WhatsApp text with everything the team needs to confirm the order. */
export function orderWhatsappMessage(order: PlacedOrder, language: Language): string {
  const darija = language === "ary";
  const customer = order.customer;
  const lines = [
    darija ? "السلام m04.shop، بغيت نأكد الطلب ديالي:" : "Bonjour m04.shop, je confirme ma commande :",
    "",
    `${darija ? "رقم الطلب" : "Commande"} : ${order.reference}`,
    ...order.items.map((item) => `• ${item.item_name} × ${item.quantity} : ${money(item.total ?? item.price * item.quantity)}`),
    ...(order.shipping ? [`${darija ? "التوصيل" : "Livraison"} : ${money(order.shipping)}`] : []),
    `${darija ? "المجموع" : "Total"} : ${money(order.total)} (${darija ? "الخلاص ملي توصلني السلعة" : "paiement à la livraison"})`,
  ];
  if (customer) {
    lines.push(
      "",
      `${darija ? "الإسم" : "Nom"} : ${customer.name}`,
      `${darija ? "التيليفون" : "Téléphone"} : ${customer.phone}`,
      `${darija ? "المدينة" : "Ville"} : ${customer.city}`,
      `${darija ? "العنوان" : "Adresse"} : ${customer.address}`,
    );
    if (customer.comment) lines.push(`${darija ? "ملاحظة" : "Remarque"} : ${customer.comment}`);
  }
  return lines.join("\n");
}

/**
 * Thank-you screen after an order, with a WhatsApp button that opens a chat with the
 * shop pre-filled with the order summary. `as="page"` for the cart page (h1), "section"
 * inside the product page form (h2).
 */
export function OrderThanks({ order, as = "section" }: { order: PlacedOrder; as?: "page" | "section" }) {
  const { language } = useStore();
  const copy = COPY[language === "ary" ? "ary" : "fr"];
  const [number, setNumber] = useState(SHOP_WHATSAPP);
  const Heading = as === "page" ? "h1" : "h2";
  const box = useRef<HTMLDivElement>(null);

  // On the product page the form is replaced in place: bring the thank-you into view.
  useEffect(() => {
    if (as === "section") box.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [as]);

  useEffect(() => {
    getHomeContent().then((home) => home.social.whatsapp && setNumber(home.social.whatsapp)).catch(() => undefined);
  }, []);

  const href = whatsappLink(number, orderWhatsappMessage(order, language));
  const firstName = order.customer?.name.trim().split(/\s+/)[0];

  return (
    <div ref={box} className={`order-thanks order-thanks-${as}`} role="status">
      <span className="confirmation-mark" aria-hidden="true"><CheckIcon size={28} weight="bold" /></span>
      <p className="section-kicker">{copy.kicker}</p>
      <Heading>{copy.title}</Heading>
      <p className="order-thanks-lead">{firstName ? copy.hello(firstName) : copy.lead}</p>

      <dl className="order-thanks-summary">
        <div><dt>{copy.reference}</dt><dd dir="ltr"><strong>{order.reference}</strong></dd></div>
        {order.items.map((item) => (
          <div key={`${item.item_id}-${item.item_name}`}>
            <dt dir="auto">{item.item_name} <span className="order-thanks-qty">× {item.quantity}</span></dt>
            <dd>{formatPrice(item.total ?? item.price * item.quantity, language)}</dd>
          </div>
        ))}
        {order.shipping !== undefined ? (
          <div><dt>{copy.shipping}</dt><dd>{order.shipping ? formatPrice(order.shipping, language) : copy.free}</dd></div>
        ) : null}
        <div className="order-thanks-total"><dt>{copy.total}</dt><dd><strong>{formatPrice(order.total, language)}</strong></dd></div>
        {order.customer ? (
          <div className="order-thanks-address"><dt>{copy.deliverTo}</dt><dd dir="auto">{order.customer.name} · {order.customer.city} · {order.customer.address}</dd></div>
        ) : null}
      </dl>

      <div className="order-thanks-whatsapp">
        <strong>{copy.confirmTitle}</strong>
        <p>{copy.confirmText}</p>
        <a
          className="button whatsapp-button"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackPixel("Contact", { content_name: "order_confirmation_whatsapp" })}
        >
          <WhatsappLogoIcon size={22} weight="fill" aria-hidden="true" />
          {copy.button}
        </a>
      </div>

      <Link className="button button-ghost" href="/boutique">{copy.continue}</Link>
    </div>
  );
}
