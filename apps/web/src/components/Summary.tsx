import { formatCents, type Totals } from "@shopnest/shared";

export function Summary({ totals }: { totals: Totals }) {
  const row = (label: string, cents: number, negative = false) => (
    <div className="flex justify-between">
      <dt className="text-stone-600">{label}</dt>
      <dd className="tabular-nums">{negative && cents > 0 ? "−" : ""}{formatCents(cents)}</dd>
    </div>
  );
  return (
    <dl className="space-y-2 text-sm">
      {row("Subtotal", totals.subtotalCents)}
      {totals.discountCents > 0 && row("Discount", totals.discountCents, true)}
      {row("Shipping", totals.shippingCents)}
      {row("Tax", totals.taxCents)}
      <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatCents(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}
