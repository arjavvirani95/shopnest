import { describe, expect, it } from "vitest";
import { cartReducer, itemCount } from "./cart";

describe("cartReducer", () => {
  it("adds and merges lines", () => {
    let s = cartReducer([], { type: "add", productId: "a" });
    s = cartReducer(s, { type: "add", productId: "a", quantity: 2 });
    s = cartReducer(s, { type: "add", productId: "b" });
    expect(s).toEqual([{ productId: "a", quantity: 3 }, { productId: "b", quantity: 1 }]);
    expect(itemCount(s)).toBe(4);
  });

  it("caps quantity at 20", () => {
    const s = cartReducer([{ productId: "a", quantity: 19 }], { type: "add", productId: "a", quantity: 5 });
    expect(s[0].quantity).toBe(20);
  });

  it("removes lines when set to zero", () => {
    expect(cartReducer([{ productId: "a", quantity: 2 }], { type: "set", productId: "a", quantity: 0 })).toEqual([]);
  });

  it("clears", () => {
    expect(cartReducer([{ productId: "a", quantity: 2 }], { type: "clear" })).toEqual([]);
  });
});
