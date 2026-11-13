"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";

/** Product grid revealed once, card after card, when it scrolls into view (CSS animation). */
export function ProductGrid({ products, className = "" }: { products: Product[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={`product-grid reveal-grid${visible ? " is-visible" : ""} ${className}`}>
      {products.map((product, index) => (
        <div className="product-grid-item" key={product.id} style={{ "--reveal-index": Math.min(index, 12) } as CSSProperties}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
