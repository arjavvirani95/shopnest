import { randomUUID } from "node:crypto";
import type { Order, Product } from "@shopnest/shared";
import { seedProducts } from "./catalog";

export class OutOfStockError extends Error {
  constructor(public productIds: string[]) {
    super(`Not enough stock for: ${productIds.join(", ")}`);
  }
}

/** In-memory store; swap for a database-backed implementation with the same interface. */
export class Store {
  private products = new Map<string, Product>();
  private orders = new Map<string, Order>();

  constructor(products: Product[] = seedProducts()) {
    for (const p of products) this.products.set(p.id, { ...p });
  }

  listProducts(filter: { category?: string; q?: string } = {}): Product[] {
    const q = filter.q?.toLowerCase();
    return [...this.products.values()].filter(
      (p) => (!filter.category || p.category === filter.category) && (!q || p.name.toLowerCase().includes(q)),
    );
  }

  getProduct(id: string) {
    return this.products.get(id);
  }

  getProductBySlug(slug: string) {
    return [...this.products.values()].find((p) => p.slug === slug);
  }

  /** Checks all lines first, then decrements, so a failed order never partially reserves stock. */
  placeOrder(input: Omit<Order, "id" | "createdAt" | "status">): Order {
    const short = input.lines.filter((l) => (this.products.get(l.productId)?.stock ?? 0) < l.quantity);
    if (short.length) throw new OutOfStockError(short.map((l) => l.productId));
    for (const l of input.lines) this.products.get(l.productId)!.stock -= l.quantity;
    const order: Order = { ...input, id: randomUUID(), createdAt: new Date().toISOString(), status: "paid" };
    this.orders.set(order.id, order);
    return order;
  }

  getOrder(id: string) {
    return this.orders.get(id);
  }
}
