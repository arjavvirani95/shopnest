import { z } from "zod";

/** All money values are integer cents to avoid floating point errors. */
export const Cents = z.number().int().nonnegative();

export const Product = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  priceCents: Cents,
  category: z.enum(["home", "kitchen", "outdoor", "stationery"]),
  imageUrl: z.string(),
  stock: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof Product>;

export const CartLine = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(20),
});
export type CartLine = z.infer<typeof CartLine>;

export const Address = z.object({
  name: z.string().trim().min(1).max(100),
  line1: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().length(2).toUpperCase(),
});

export const CheckoutRequest = z.object({
  email: z.string().email(),
  lines: z.array(CartLine).min(1).max(50),
  address: Address,
  discountCode: z.string().trim().toUpperCase().optional(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequest>;

export const Totals = z.object({
  subtotalCents: Cents,
  discountCents: Cents,
  shippingCents: Cents,
  taxCents: Cents,
  totalCents: Cents,
});
export type Totals = z.infer<typeof Totals>;

export const Order = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.string(),
  status: z.enum(["paid", "shipped", "cancelled"]),
  lines: z.array(z.object({ productId: z.string(), name: z.string(), unitCents: Cents, quantity: z.number().int() })),
  totals: Totals,
});
export type Order = z.infer<typeof Order>;
