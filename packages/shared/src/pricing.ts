import type { Product, Totals } from "./schemas";

export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;
export const FLAT_SHIPPING_CENTS = 699;
export const TAX_RATE = 0.08;

export interface Discount {
  code: string;
  kind: "percent" | "fixed";
  value: number; // percent (0-100) or cents
  minSubtotalCents?: number;
}

export const DISCOUNTS: Record<string, Discount> = {
  WELCOME10: { code: "WELCOME10", kind: "percent", value: 10 },
  SAVE15: { code: "SAVE15", kind: "fixed", value: 1500, minSubtotalCents: 6000 },
};

export interface PricedLine {
  product: Pick<Product, "id" | "priceCents">;
  quantity: number;
}

export type DiscountResult = { ok: true; discount: Discount } | { ok: false; reason: string };

export function resolveDiscount(code: string | undefined, subtotalCents: number): DiscountResult | null {
  if (!code) return null;
  const d = DISCOUNTS[code.trim().toUpperCase()];
  if (!d) return { ok: false, reason: "Unknown discount code" };
  if (d.minSubtotalCents && subtotalCents < d.minSubtotalCents) {
    return { ok: false, reason: `Requires a subtotal of at least $${(d.minSubtotalCents / 100).toFixed(2)}` };
  }
  return { ok: true, discount: d };
}

/**
 * Order of operations: subtotal → discount → shipping (free over threshold, judged after discount)
 * → tax on discounted subtotal + shipping. Each step is rounded to whole cents.
 */
export function computeTotals(lines: PricedLine[], discountCode?: string): Totals & { discountError?: string } {
  const subtotalCents = lines.reduce((acc, l) => acc + l.product.priceCents * l.quantity, 0);
  const resolved = resolveDiscount(discountCode, subtotalCents);

  let discountCents = 0;
  if (resolved?.ok) {
    const d = resolved.discount;
    discountCents = d.kind === "percent" ? Math.round((subtotalCents * d.value) / 100) : d.value;
    discountCents = Math.min(discountCents, subtotalCents);
  }

  const afterDiscount = subtotalCents - discountCents;
  const shippingCents = subtotalCents === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const taxCents = Math.round((afterDiscount + shippingCents) * TAX_RATE);

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents: afterDiscount + shippingCents + taxCents,
    ...(resolved && !resolved.ok ? { discountError: resolved.reason } : {}),
  };
}

export const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
