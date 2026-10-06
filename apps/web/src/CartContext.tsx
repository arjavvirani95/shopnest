import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { CartLine } from "@shopnest/shared";
import { cartReducer, type CartAction } from "./cart";

const KEY = "shopnest:cart";

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const CartCtx = createContext<{ lines: CartLine[]; dispatch: (a: CartAction) => void } | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);
  return <CartCtx.Provider value={{ lines, dispatch }}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
