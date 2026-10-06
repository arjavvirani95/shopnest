import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FREE_SHIPPING_THRESHOLD_CENTS, formatCents } from "@shopnest/shared";
import { api } from "../api";
import { useCart } from "../CartContext";
import { Summary } from "../components/Summary";
import { useAsync } from "../useAsync";

export function CartPage() {
  const { lines, dispatch } = useCart();
  const navigate = useNavigate();
  const [codeInput, setCodeInput] = useState(() => sessionStorage.getItem("discount") ?? "");
  const [code, setCode] = useState(codeInput);
  const { data: products } = useAsync(() => api.products(), []);
  const { data: quote } = useAsync(() => api.quote(lines, code || undefined), [JSON.stringify(lines), code]);

  if (lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block underline">Continue shopping</Link>
      </div>
    );
  }

  const byId = new Map(products?.map((p) => [p.id, p]));
  const remaining = quote ? FREE_SHIPPING_THRESHOLD_CENTS - (quote.subtotalCents - quote.discountCents) : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-stone-200">
        {lines.map((l) => {
          const p = byId.get(l.productId);
          return (
            <li key={l.productId} className="flex items-center gap-4 py-4">
              {p && <img src={p.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />}
              <div className="flex-1">
                <p className="font-medium">{p?.name ?? l.productId}</p>
                {p && <p className="text-sm text-stone-500">{formatCents(p.priceCents)}</p>}
              </div>
              <select
                aria-label="Quantity"
                value={l.quantity}
                onChange={(e) => dispatch({ type: "set", productId: l.productId, quantity: Number(e.target.value) })}
                className="rounded-md border border-stone-300 bg-white px-2 py-1"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
              </select>
              <button onClick={() => dispatch({ type: "remove", productId: l.productId })} className="text-sm text-stone-500 hover:text-ink">
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setCode(codeInput.trim());
            sessionStorage.setItem("discount", codeInput.trim());
          }}
        >
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Discount code"
            className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm uppercase"
          />
          <button className="rounded-md border border-ink px-3 text-sm">Apply</button>
        </form>
        {quote?.discountError && <p className="-mt-4 mb-4 text-sm text-red-700">{quote.discountError}</p>}
        {quote && <Summary totals={quote} />}
        {quote && remaining > 0 && (
          <p className="mt-4 text-sm text-stone-600">Add {formatCents(remaining)} more for free shipping.</p>
        )}
        <button
          onClick={() => navigate("/checkout")}
          className="mt-6 w-full rounded-full bg-ink py-3 font-medium text-white"
        >
          Checkout
        </button>
      </aside>
    </div>
  );
}
