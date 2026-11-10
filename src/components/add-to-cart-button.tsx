"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Variant = { id: number; name: string; available: boolean };

export function AddToCartButton({ productId, variants }: { productId: number; variants: Variant[] }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const variant = variants.find((item) => item.available);

  async function addToCart() {
    if (!variant) return;
    setPending(true);
    setMessage("");
    try {
      await apiFetch("/cart/" + productId, {
        method: "POST",
        body: JSON.stringify({ variant_id: variant.id, quantity: 1 }),
      });
      setMessage("Ajouté au panier");
    } catch {
      setMessage("Ajout impossible, réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4">
      <button onClick={addToCart} disabled={!variant || pending} className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400">
        {!variant ? "Indisponible" : pending ? "Ajout…" : "Ajouter au panier"}
      </button>
      {message ? <p role="status" className="mt-2 text-center text-xs text-zinc-600">{message}</p> : null}
    </div>
  );
}
