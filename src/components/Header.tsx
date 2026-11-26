"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/tienda", label: "Catálogo" },
  { href: "/tienda?categoria=pijamas", label: "Pijamas" },
  { href: "/tienda?categoria=buzos", label: "Buzos" },
  { href: "/tienda?categoria=chaquetas", label: "Chaquetas" },
  { href: "/tienda?ofertas=1", label: "Remates" },
];

export function Header() {
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  if (pathname.startsWith("/admin")) return null;

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    setSearchOpen(false);
    router.push(q ? `/tienda?q=${encodeURIComponent(q)}` : "/tienda");
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-6xl">
        {/* Barra principal flotante Liquid Glass */}
        <div className="glass-float flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 sm:gap-4 sm:px-5">
          <button
            type="button"
            className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full text-ink transition hover:bg-white/70 active:scale-95 md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => {
              setOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <Link
            href="/"
            className="font-display shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-ink transition hover:opacity-85 sm:text-2xl"
          >
            EDNA <span className="text-clay-dark">ATELIER</span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="ml-3 hidden items-center gap-1 text-sm font-medium md:flex"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-ink/90 transition duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:text-clay-dark"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={onSearch} className="ml-auto hidden w-52 lg:block">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pijama, buzo…"
              className="input !min-h-10 !rounded-full !border-white/80 !bg-white/65 !py-1.5 !text-sm focus:!bg-white"
              aria-label="Buscar prendas"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              type="button"
              className="grid min-h-11 min-w-11 place-items-center rounded-full text-ink transition hover:bg-white/70 active:scale-95 lg:hidden"
              aria-label="Buscar prendas"
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((v) => !v);
                setOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>

            <Link
              href="/carrito"
              className="relative grid min-h-11 min-w-11 place-items-center rounded-full text-ink transition hover:-translate-y-0.5 hover:bg-white/75 active:scale-95"
              aria-label={`Carrito (${count} artículos)`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
                <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
              </svg>
              {count > 0 && (
                  <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-volt px-1 text-[11px] font-bold text-ink shadow">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Panel flotante de búsqueda móvil */}
        {searchOpen && (
          <div className="glass-surface mt-2 rounded-3xl p-3 lg:hidden">
            <form onSubmit={onSearch} className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pijamas, buzos, remates…"
                className="input min-w-0 flex-1 !rounded-full"
                aria-label="Buscar prendas"
                autoFocus
              />
              <button type="submit" className="btn-primary shrink-0 !px-5">
                Buscar
              </button>
            </form>
          </div>
        )}

        {/* Menú flotante móvil */}
        {open && (
          <div className="glass-surface mt-2 rounded-3xl p-4 md:hidden">
            <form onSubmit={onSearch} className="mb-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pijamas, buzos, chaquetas…"
                className="input !rounded-full"
                aria-label="Buscar prendas"
              />
            </form>
            <nav aria-label="Menú móvil" className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-between rounded-2xl px-3.5 py-2 text-base font-medium text-ink transition hover:bg-white/70"
                >
                  <span>{l.label}</span>
                  <span aria-hidden="true" className="text-clay-dark">
                    →
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
