import { Link } from "react-router";
import { formatCents, type Product } from "@shopnest/shared";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/p/${product.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-xl bg-stone-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-medium">{product.name}</h3>
        <span className="tabular-nums">{formatCents(product.priceCents)}</span>
      </div>
      {product.stock === 0 && <p className="text-sm text-stone-500">Sold out</p>}
    </Link>
  );
}
