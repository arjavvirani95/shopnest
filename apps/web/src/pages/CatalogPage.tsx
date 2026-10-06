import { useSearchParams } from "react-router";
import { api } from "../api";
import { ProductCard } from "../components/ProductCard";
import { useAsync } from "../useAsync";

const CATEGORIES = ["all", "home", "kitchen", "outdoor", "stationery"] as const;

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "all";
  const q = params.get("q") ?? "";
  const { data, error, loading } = useAsync(
    () => api.products({ category: category === "all" ? undefined : category, q: q || undefined }),
    [category, q],
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => update("category", c)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                c === category ? "bg-ink text-white" : "border border-stone-300 hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="search"
          defaultValue={q}
          placeholder="Search products"
          onChange={(e) => update("q", e.target.value)}
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm sm:w-64"
        />
      </div>
      {error && <p className="text-red-700">{error.message}</p>}
      {loading && !data && <p className="text-stone-500">Loading…</p>}
      {data && data.length === 0 && <p className="text-stone-500">No products match.</p>}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {data?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}
