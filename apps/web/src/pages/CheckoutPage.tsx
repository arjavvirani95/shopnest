import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { api } from "../api";
import { useCart } from "../CartContext";

const FIELDS = [
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "line1", label: "Address", autoComplete: "address-line1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country (2-letter code)", autoComplete: "country", maxLength: 2 },
] as const;

export function CheckoutPage() {
  const { lines, dispatch } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (lines.length === 0) return <Navigate to="/cart" replace />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.checkout({
        email: f.email,
        lines,
        address: { name: f.name, line1: f.line1, city: f.city, postalCode: f.postalCode, country: f.country },
        discountCode: sessionStorage.getItem("discount") || undefined,
      });
      dispatch({ type: "clear" });
      sessionStorage.removeItem("discount");
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="text-sm text-stone-500">Demo store: no payment is taken.</p>
      {FIELDS.map((field) => (
        <label key={field.name} className="block text-sm">
          {field.label}
          <input
            required
            {...field}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2"
          />
        </label>
      ))}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={submitting} className="w-full rounded-full bg-ink py-3 font-medium text-white disabled:opacity-60">
        {submitting ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
