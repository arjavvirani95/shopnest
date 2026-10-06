import { useState } from "react";
import { Link, useParams } from "react-router";
import { formatCents } from "@shopnest/shared";
import { api } from "../api";
import { useCart } from "../CartContext";
import { useAsync } from "../useAsync";

export function ProductPage() {
  const { slug = "" } = useParams();
  const { data: product, error } = useAsync(() => api.product(slug), [slug]);
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);

  if (error) return <p>{error.message}. <Link className="underline" to="/">Back to shop</Link></p>;
  if (!product) return <p className="text-stone-500">Loading…</p>;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <img src={product.imageUrl} alt={product.name} className="aspect-square w-full rounded-2xl object-cover" />
      <div>
        <p className="text-sm uppercase tracking-wide text-stone-500">{product.category}</p>
        <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-3 text-2xl tabular-nums">{formatCents(product.priceCents)}</p>
        <p className="mt-6 text-stone-700">{product.description}</p>
        <button
          disabled={product.stock === 0}
          onClick={() => {
            dispatch({ type: "add", productId: product.id });
            setAdded(true);
          }}
          className="mt-8 w-full rounded-full bg-ink py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {product.stock === 0 ? "Sold out" : "Add to cart"}
        </button>
        {added && (
          <p className="mt-3 text-sm">
            Added. <Link to="/cart" className="underline">View cart</Link>
          </p>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <p className="mt-3 text-sm text-accent">Only {product.stock} left</p>
        )}
      </div>
    </div>
  );
}
