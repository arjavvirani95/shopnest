import { describe, expect, it } from "vitest";
import { computeTotals, formatCents } from "./pricing";
import { CheckoutRequest } from "./schemas";

const line = (priceCents: number, quantity: number) => ({ product: { id: String(priceCents), priceCents }, quantity });

describe("computeTotals", () => {
  it("charges flat shipping under the threshold", () => {
    expect(computeTotals([line(2000, 2)])).toEqual({
      subtotalCents: 4000, discountCents: 0, shippingCents: 699, taxCents: 376, totalCents: 5075,
    });
  });

  it("gives free shipping at or over the threshold", () => {
    expect(computeTotals([line(7500, 1)]).shippingCents).toBe(0);
  });

  it("judges free shipping after the discount", () => {
    const t = computeTotals([line(8000, 1)], "welcome10");
    expect(t.discountCents).toBe(800);
    expect(t.shippingCents).toBe(699);
  });

  it("enforces minimum subtotal on fixed discounts", () => {
    const t = computeTotals([line(5000, 1)], "SAVE15");
    expect(t.discountCents).toBe(0);
    expect(t.discountError).toMatch(/at least \$60\.00/);
    expect(computeTotals([line(6000, 1)], "SAVE15").discountCents).toBe(1500);
  });

  it("reports unknown codes and handles empty carts", () => {
    expect(computeTotals([line(1000, 1)], "NOPE").discountError).toBe("Unknown discount code");
    expect(computeTotals([]).totalCents).toBe(0);
  });
});

describe("schemas", () => {
  it("normalises checkout input", () => {
    const parsed = CheckoutRequest.parse({
      email: "a@b.co",
      lines: [{ productId: "p1", quantity: 1 }],
      address: { name: "Ada", line1: "1 Main St", city: "Austin", postalCode: "73301", country: "us" },
      discountCode: " welcome10 ",
    });
    expect(parsed.address.country).toBe("US");
    expect(parsed.discountCode).toBe("WELCOME10");
  });

  it("rejects quantities over the limit", () => {
    expect(() => CheckoutRequest.shape.lines.parse([{ productId: "p", quantity: 99 }])).toThrow();
  });
});

it("formats cents as dollars", () => expect(formatCents(123456)).toBe("$1,234.56"));
