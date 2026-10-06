import type { CartLine } from "@shopnest/shared";

export const MAX_QTY = 20;

export type CartAction =
  | { type: "add"; productId: string; quantity?: number }
  | { type: "set"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const qty = action.quantity ?? 1;
      const existing = lines.find((l) => l.productId === action.productId);
      if (!existing) return [...lines, { productId: action.productId, quantity: Math.min(qty, MAX_QTY) }];
      return lines.map((l) =>
        l.productId === action.productId ? { ...l, quantity: Math.min(l.quantity + qty, MAX_QTY) } : l,
      );
    }
    case "set":
      if (action.quantity <= 0) return lines.filter((l) => l.productId !== action.productId);
      return lines.map((l) =>
        l.productId === action.productId ? { ...l, quantity: Math.min(action.quantity, MAX_QTY) } : l,
      );
    case "remove":
      return lines.filter((l) => l.productId !== action.productId);
    case "clear":
      return [];
  }
}

export const itemCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
