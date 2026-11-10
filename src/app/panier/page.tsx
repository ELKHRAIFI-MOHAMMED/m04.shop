"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type CartLine = { product_id: number; name: string; image_url: string; variant_id: number; variant: string; quantity: number; total: number; available: boolean };
type CartResponse = { data: CartLine[] };
type CheckoutResponse = { request_key: string; shipping: number };
type OrderResponse = { data: { reference: string; total: number } };

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<OrderResponse["data"] | null>(null);

  async function refresh() {
    try {
      const result = await apiFetch<CartResponse>("/cart");
      setCart(result.data);
      setError("");
    } catch {
      setError("Impossible de charger le panier.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function update(line: CartLine, quantity: number) {
    setPending(true);
    try {
      const result = await apiFetch<CartResponse>(`/cart/${line.product_id}`, {
        method: "PATCH",
        body: JSON.stringify({ variant_id: line.variant_id, quantity }),
      });
      setCart(result.data);
    } catch {
      setError("Stock insuffisant ou mise à jour impossible.");
    } finally {
      setPending(false);
    }
  }

  async function remove(line: CartLine) {
    setPending(true);
    try {
      const result = await apiFetch<CartResponse>(`/cart/${line.product_id}`, { method: "DELETE" });
      setCart(result.data);
    } catch {
      setError("Impossible de retirer cet article.");
    } finally {
      setPending(false);
    }
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const details = Object.fromEntries(form.entries());
    try {
      const checkout = await apiFetch<CheckoutResponse>("/cart/checkout", { method: "POST", body: "{}" });
      const order = await apiFetch<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify({ ...details, request_key: checkout.request_key }),
      });
      setConfirmation(order.data);
      setCart([]);
    } catch {
      setError("La commande n'a pas pu être enregistrée. Vérifiez vos informations et réessayez.");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-4xl px-6 py-16">Chargement du panier…</main>;
  if (confirmation) return <main className="mx-auto max-w-2xl px-6 py-20"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Commande reçue</p><h1 className="mt-3 text-4xl font-semibold">Merci pour votre commande.</h1><p className="mt-5 text-zinc-600">Référence : <strong>{confirmation.reference}</strong></p><p className="mt-2 text-zinc-600">Total : <strong>{confirmation.total} DH</strong></p><a href="/" className="mt-8 inline-block rounded-lg bg-zinc-950 px-5 py-3 text-white">Continuer vos achats</a></main>;

  const subtotal = cart.reduce((sum, line) => sum + Number(line.total), 0);

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <section>
        <a href="/" className="text-sm text-zinc-500 hover:text-black">← Continuer vos achats</a>
        <h1 className="mb-6 mt-4 text-3xl font-semibold">Votre panier</h1>
        {cart.length ? <div className="divide-y divide-black/10 border-y border-black/10">
          {cart.map((line) => <article key={line.product_id} className="flex gap-4 py-5">
            <img src={line.image_url} alt="" className="h-24 w-24 rounded-lg bg-zinc-100 object-cover" />
            <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
              <div><h2 className="font-medium">{line.name}</h2><p className="mt-1 text-sm text-zinc-500">{line.variant}</p><p className="mt-2 font-semibold">{line.total} DH</p></div>
              <div className="mt-3 flex items-center gap-3 sm:mt-0"><button disabled={pending || line.quantity <= 1} onClick={() => update(line, line.quantity - 1)} aria-label="Diminuer la quantité" className="h-8 w-8 rounded border">−</button><span>{line.quantity}</span><button disabled={pending || line.quantity >= 20} onClick={() => update(line, line.quantity + 1)} aria-label="Augmenter la quantité" className="h-8 w-8 rounded border">+</button><button disabled={pending} onClick={() => remove(line)} className="ml-2 text-sm text-zinc-500 underline">Retirer</button></div>
            </div>
          </article>)}
        </div> : <p className="rounded-xl bg-zinc-50 p-8 text-zinc-600">Votre panier est vide.</p>}
      </section>

      <section className="h-fit rounded-xl border border-black/10 p-6">
        <h2 className="text-xl font-semibold">Livraison et commande</h2>
        <div className="my-5 flex justify-between border-b border-black/10 pb-4 text-sm"><span>Sous-total</span><strong>{subtotal} DH</strong></div>
        {error ? <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={placeOrder} className="grid gap-3">
          <input name="name" required maxLength={190} placeholder="Nom complet" className="rounded-lg border px-3 py-3 text-sm" />
          <input name="phone" required maxLength={40} placeholder="Téléphone" className="rounded-lg border px-3 py-3 text-sm" />
          <input name="city" required maxLength={120} placeholder="Ville" className="rounded-lg border px-3 py-3 text-sm" />
          <input name="address" required maxLength={500} placeholder="Adresse" className="rounded-lg border px-3 py-3 text-sm" />
          <textarea name="comment" maxLength={500} placeholder="Note pour la livraison (facultatif)" className="min-h-20 rounded-lg border px-3 py-3 text-sm" />
          <button disabled={!cart.length || pending || cart.some((line) => !line.available)} className="mt-2 rounded-lg bg-zinc-950 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400">{pending ? "Traitement…" : "Confirmer la commande"}</button>
        </form>
      </section>
    </main>
  );
}
