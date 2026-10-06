import type { Product } from "@shopnest/shared";

const img = (slug: string) => `/api/images/${slug}.svg`;

const raw: Omit<Product, "id" | "imageUrl">[] = [
  { slug: "linen-throw-blanket", name: "Linen Throw Blanket", description: "Stonewashed linen in oatmeal, 130×170 cm.", priceCents: 6800, category: "home", stock: 14 },
  { slug: "ceramic-pour-over", name: "Ceramic Pour-Over", description: "Hand-glazed dripper that fits most mugs.", priceCents: 3200, category: "kitchen", stock: 25 },
  { slug: "walnut-serving-board", name: "Walnut Serving Board", description: "Solid walnut, finished with food-safe oil.", priceCents: 5400, category: "kitchen", stock: 8 },
  { slug: "enamel-camp-mug", name: "Enamel Camp Mug", description: "Steel mug with a speckled enamel finish, 350 ml.", priceCents: 1800, category: "outdoor", stock: 40 },
  { slug: "packable-hammock", name: "Packable Hammock", description: "Ripstop nylon hammock with tree straps.", priceCents: 7900, category: "outdoor", stock: 6 },
  { slug: "dot-grid-notebook", name: "Dot Grid Notebook", description: "A5, 160 pages of 100 gsm paper, lay-flat binding.", priceCents: 2200, category: "stationery", stock: 60 },
  { slug: "brass-pen", name: "Brass Pen", description: "Machined brass body that ages naturally.", priceCents: 4500, category: "stationery", stock: 12 },
  { slug: "soy-candle-cedar", name: "Cedar Soy Candle", description: "50-hour burn time, cotton wick.", priceCents: 2600, category: "home", stock: 30 },
  { slug: "cast-iron-skillet", name: "Cast Iron Skillet", description: "25 cm pre-seasoned skillet.", priceCents: 4900, category: "kitchen", stock: 0 },
  { slug: "wool-camp-blanket", name: "Wool Camp Blanket", description: "Heavy merino blend for cold nights.", priceCents: 9800, category: "outdoor", stock: 9 },
];

export const seedProducts = (): Product[] =>
  raw.map((p, i) => ({ ...p, id: `p${String(i + 1).padStart(3, "0")}`, imageUrl: img(p.slug) }));
