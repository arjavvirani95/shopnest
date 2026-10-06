import cors from "cors";
import express, { type ErrorRequestHandler, type Request } from "express";
import { z, ZodError } from "zod";
import { CartLine, CheckoutRequest, computeTotals, type PricedLine } from "@shopnest/shared";
import { OutOfStockError, Store } from "./store";

class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

const QuoteRequest = z.object({ lines: z.array(CartLine).max(50), discountCode: z.string().optional() });

export function createApp(store = new Store()) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  /** Joins cart lines to catalog products, failing on unknown ids. Prices always come from the server. */
  function price(lines: CartLine[]): PricedLine[] {
    return lines.map((l) => {
      const product = store.getProduct(l.productId);
      if (!product) throw new HttpError(400, `Unknown product ${l.productId}`);
      return { product, quantity: l.quantity };
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/products", (req: Request<unknown, unknown, unknown, { category?: string; q?: string }>, res) => {
    res.json(store.listProducts({ category: req.query.category, q: req.query.q }));
  });

  app.get("/api/products/:slug", (req, res) => {
    const product = store.getProductBySlug(req.params.slug);
    if (!product) throw new HttpError(404, "Product not found");
    res.json(product);
  });

  app.post("/api/cart/quote", (req, res) => {
    const { lines, discountCode } = QuoteRequest.parse(req.body);
    res.json(computeTotals(price(lines), discountCode));
  });

  app.post("/api/orders", (req, res) => {
    const body = CheckoutRequest.parse(req.body);
    const priced = price(body.lines);
    const totals = computeTotals(priced, body.discountCode);
    if (totals.discountError) throw new HttpError(400, totals.discountError);
    const { discountError: _, ...cleanTotals } = totals;
    const order = store.placeOrder({
      email: body.email,
      totals: cleanTotals,
      lines: priced.map(({ product, quantity }) => ({
        productId: product.id,
        name: store.getProduct(product.id)!.name,
        unitCents: product.priceCents,
        quantity,
      })),
    });
    res.status(201).json(order);
  });

  app.get("/api/orders/:id", (req, res) => {
    const order = store.getOrder(req.params.id);
    if (!order) throw new HttpError(404, "Order not found");
    res.json(order);
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
    } else if (err instanceof OutOfStockError) {
      res.status(409).json({ error: err.message, productIds: err.productIds });
    } else if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
    } else if (err?.type === "entity.parse.failed") {
      res.status(400).json({ error: "Malformed JSON" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  app.use(onError);

  return app;
}
