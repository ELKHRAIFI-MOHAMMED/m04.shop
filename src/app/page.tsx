import { AddToCartButton } from "@/components/add-to-cart-button";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  sale_price: string | null;
  images: { url: string; alt: string | null }[];
  variants: { id: number; name: string; available: boolean }[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api/v1";

export const instant = false;

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${apiUrl}/products?per_page=12`, { cache: "no-store" });
    if (!response.ok) return [];
    const result = await response.json();
    return result.data ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between border-b border-black/10 pb-5">
        <a href="/" className="text-2xl font-bold tracking-tight">m04<span className="text-emerald-600">.</span></a>
        <a href="/panier" className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5">Mon panier</a>
      </header>

      <section className="grid gap-5 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Technologie & accessoires</p>
        <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">Les essentiels qui simplifient votre quotidien.</h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600">Une sélection de produits utiles, choisis pour leur qualité, leur simplicité et leur prix juste.</p>
      </section>

      <section className="pb-20" aria-labelledby="catalog-title">
        <div className="mb-6 flex items-end justify-between border-b border-black/10 pb-4">
          <div><p className="text-sm text-zinc-500">La sélection m04</p><h2 id="catalog-title" className="mt-1 text-2xl font-semibold">Nos produits</h2></div>
          <span className="text-sm text-zinc-500">{products.length} produits</span>
        </div>
        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const image = product.images[0];
              return (
                <article key={product.id} className="overflow-hidden rounded-xl border border-black/10 bg-white">
                  <div className="aspect-[4/3] bg-zinc-100">
                    {image ? <img src={image.url} alt={image.alt ?? product.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="mt-2 text-lg font-semibold">{product.sale_price ?? product.price} DH</p>
                    <AddToCartButton productId={product.id} variants={product.variants} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl bg-zinc-50 p-8 text-zinc-600">Le catalogue est momentanément indisponible. Réessayez dans quelques instants.</p>
        )}
      </section>
    </main>
  );
}
