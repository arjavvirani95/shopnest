# shopnest

[![CI](https://github.com/arjavvirani95/shopnest/actions/workflows/ci.yml/badge.svg)](https://github.com/arjavvirani95/shopnest/actions/workflows/ci.yml)

A full-stack e-commerce demo in a **pnpm monorepo**: a **React + React Router + Tailwind** storefront, an **Express 5** API, and a **shared package** of Zod schemas and pricing logic used by both.

```
packages/shared   Zod schemas (Product, CheckoutRequest, Order), pricing engine, formatters
apps/api          Express API: catalog, cart quotes, checkout with stock reservation
apps/web          Vite + React storefront: catalog, product, cart, checkout, order confirmation
```

## Highlights

- **One source of truth for types and rules.** The API validates requests with the same Zod schemas the frontend imports, and pricing (discounts, free-shipping threshold, tax) is a pure, tested function in `@shopnest/shared`.
- **Prices come from the server.** The client sends product ids and quantities only; the API joins them to the catalog before quoting or charging.
- **Integer cents everywhere**, with rounding at each step, so totals are always exact.
- **All-or-nothing stock reservation.** Checkout checks every line before decrementing, and a shortage returns `409` with the product ids involved.
- Cart saved to `localStorage`; category and search filters live in the URL.
- Consistent JSON errors (`400` with Zod issue paths, `404`, `409`, malformed JSON).

## Try it

```bash
pnpm install
pnpm dev                 # API on :4000, web on :5173 (proxied /api)
pnpm test                # shared + api (supertest) + web
```

Discount codes: `WELCOME10` (10% off) and `SAVE15` ($15 off orders of $60 or more).

## API

| Method | Path                    | Description                                   |
|--------|-------------------------|-----------------------------------------------|
| GET    | `/api/products`         | List, with `?category=` and `?q=` filters      |
| GET    | `/api/products/:slug`   | Product detail                                |
| POST   | `/api/cart/quote`       | Totals for `{ lines, discountCode? }`         |
| POST   | `/api/orders`           | Checkout: validate, price, reserve stock      |
| GET    | `/api/orders/:id`       | Order confirmation                            |

## License

MIT
