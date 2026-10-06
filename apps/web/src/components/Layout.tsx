import { Link, NavLink, Outlet } from "react-router";
import { itemCount } from "../cart";
import { useCart } from "../CartContext";

export function Layout() {
  const { lines } = useCart();
  const count = itemCount(lines);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-semibold tracking-tight">shopnest</Link>
          <NavLink to="/cart" className="rounded-full border border-stone-300 px-4 py-1.5 text-sm hover:border-ink">
            Cart{count > 0 && <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-xs text-white">{count}</span>}
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
