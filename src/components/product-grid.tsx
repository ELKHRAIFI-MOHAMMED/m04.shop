import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";

/**
 * Product grid. Cards are on the page at once: nothing waits for a scroll to appear.
 * One or two products become wide feature cards instead of a row left half empty.
 */
export function ProductGrid({ products, className = "" }: { products: Product[]; className?: string }) {
  return (
    <div className={`product-grid${products.length <= 2 ? " product-grid-feature" : ""} ${className}`.trim()}>
      {products.map((product) => (
        <div className="product-grid-item" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
