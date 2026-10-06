import type { CartLine, CheckoutRequest, Order, Product, Totals } from "@shopnest/shared";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  products: (params: { category?: string; q?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    return call<Product[]>(`/products${qs.size ? `?${qs}` : ""}`);
  },
  product: (slug: string) => call<Product>(`/products/${slug}`),
  quote: (lines: CartLine[], discountCode?: string) =>
    call<Totals & { discountError?: string }>("/cart/quote", { method: "POST", body: JSON.stringify({ lines, discountCode }) }),
  checkout: (req: CheckoutRequest) => call<Order>("/orders", { method: "POST", body: JSON.stringify(req) }),
  order: (id: string) => call<Order>(`/orders/${id}`),
};
