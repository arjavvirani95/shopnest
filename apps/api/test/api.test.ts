import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { Store } from "../src/store";

let app: ReturnType<typeof createApp>;
beforeEach(() => {
  app = createApp(new Store());
});

const address = { name: "Ada Lovelace", line1: "1 Analytical Way", city: "London", postalCode: "N1 9GU", country: "gb" };

describe("products", () => {
  it("lists and filters", async () => {
    const all = await request(app).get("/api/products").expect(200);
    expect(all.body).toHaveLength(10);
    const kitchen = await request(app).get("/api/products?category=kitchen").expect(200);
    expect(kitchen.body.every((p: { category: string }) => p.category === "kitchen")).toBe(true);
    const search = await request(app).get("/api/products?q=blanket").expect(200);
    expect(search.body).toHaveLength(2);
  });

  it("gets by slug or 404s", async () => {
    await request(app).get("/api/products/brass-pen").expect(200);
    await request(app).get("/api/products/nope").expect(404);
  });
});

describe("quote", () => {
  it("prices from the server catalog", async () => {
    const res = await request(app)
      .post("/api/cart/quote")
      .send({ lines: [{ productId: "p002", quantity: 2 }], discountCode: "welcome10" })
      .expect(200);
    expect(res.body).toMatchObject({ subtotalCents: 6400, discountCents: 640, shippingCents: 699 });
  });

  it("rejects unknown products", async () => {
    await request(app).post("/api/cart/quote").send({ lines: [{ productId: "zzz", quantity: 1 }] }).expect(400);
  });
});

describe("orders", () => {
  it("places an order, decrements stock and can be fetched", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ email: "ada@example.com", address, lines: [{ productId: "p005", quantity: 2 }] })
      .expect(201);
    expect(res.body.status).toBe("paid");
    expect(res.body.totals.totalCents).toBe(Math.round(15800 * 1.08));
    await request(app).get(`/api/orders/${res.body.id}`).expect(200);

    const product = await request(app).get("/api/products/packable-hammock");
    expect(product.body.stock).toBe(4);
  });

  it("returns 409 when stock is short and reserves nothing", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ email: "a@b.co", address, lines: [{ productId: "p001", quantity: 1 }, { productId: "p009", quantity: 1 }] })
      .expect(409);
    expect(res.body.productIds).toEqual(["p009"]);
    const blanket = await request(app).get("/api/products/linen-throw-blanket");
    expect(blanket.body.stock).toBe(14);
  });

  it("validates the payload and discount", async () => {
    await request(app).post("/api/orders").send({ email: "bad", lines: [] }).expect(400);
    const res = await request(app)
      .post("/api/orders")
      .send({ email: "a@b.co", address, lines: [{ productId: "p004", quantity: 1 }], discountCode: "SAVE15" })
      .expect(400);
    expect(res.body.error).toMatch(/at least/);
  });

  it("handles malformed JSON", async () => {
    await request(app).post("/api/orders").set("content-type", "application/json").send("{bad").expect(400);
  });
});

describe("images", () => {
  it("serves an SVG tile per product", async () => {
    const res = await request(app)
      .get("/api/images/brass-pen.svg")
      .buffer(true)
      .parse((r, cb) => {
        let data = "";
        r.on("data", (c: Buffer) => (data += c));
        r.on("end", () => cb(null, data));
      })
      .expect(200);
    expect(res.headers["content-type"]).toContain("image/svg+xml");
    expect(res.body).toContain("Brass Pen");
    await request(app).get("/api/images/nope.svg").expect(404);
  });
});
