import type { Product } from "@shopnest/shared";

const PALETTE: Record<Product["category"], [string, string]> = {
  home: ["#e7d8c9", "#8a6a4f"],
  kitchen: ["#d9e4dd", "#46695a"],
  outdoor: ["#d6e2ec", "#3d5a73"],
  stationery: ["#ece3f0", "#6b4f7a"],
};

const ICON: Record<Product["category"], string> = {
  home: '<path d="M300 210 200 290v110h70v-70h60v70h70V290z" />',
  kitchen: '<path d="M215 260h170v30a85 85 0 0 1-170 0zm170 20h30a25 25 0 0 1 0 50h-34" fill="none" stroke-width="16"/>',
  outdoor: '<path d="M300 200 190 400h220zM300 200v-20m-15 10h30" stroke-width="14"/>',
  stationery: '<path d="m360 200 40 40-150 150-50 10 10-50z" />',
};

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Simple branded product tile, so the demo needs no external image hosting. */
export function productSvg(p: Product): string {
  const [bg, fg] = PALETTE[p.category];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="${bg}"/>
  <g fill="${fg}" stroke="${fg}" stroke-linejoin="round" stroke-linecap="round">${ICON[p.category]}</g>
  <text x="300" y="490" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="34" fill="${fg}">${escape(p.name)}</text>
</svg>`;
}
