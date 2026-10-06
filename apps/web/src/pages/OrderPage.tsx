import { Link, useParams } from "react-router";
import { formatCents } from "@shopnest/shared";
import { api } from "../api";
import { Summary } from "../components/Summary";
import { useAsync } from "../useAsync";

export function OrderPage() {
  const { id = "" } = useParams();
  const { data: order, error } = useAsync(() => api.order(id), [id]);
  if (error) return <p>{error.message}</p>;
  if (!order) return <p className="text-stone-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">Thanks for your order!</h1>
      <p className="mt-1 text-sm text-stone-500">
        Order {order.id.slice(0, 8)} · confirmation sent to {order.email}
      </p>
      <ul className="my-6 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white px-5">
        {order.lines.map((l) => (
          <li key={l.productId} className="flex justify-between py-3 text-sm">
            <span>{l.quantity} × {l.name}</span>
            <span className="tabular-nums">{formatCents(l.unitCents * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <Summary totals={order.totals} />
      <Link to="/" className="mt-8 inline-block underline">Continue shopping</Link>
    </div>
  );
}
