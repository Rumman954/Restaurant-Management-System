import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Categories", to: "/food-categories" },
    { label: "Foods", to: "/foods" },
    { label: "Contact", to: "/about" },
  ];

  const accountItems = [
    { label: "Login", to: "/about" },
    { label: "Register", to: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-rose-300 bg-[#ee6e73] text-white shadow-sm">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="brand-logo text-3xl leading-none tracking-wide text-white transition hover:text-rose-100"
          onClick={() => setIsMenuOpen(false)}
        >
          Restaurant
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-white/95 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {accountItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.to}
              className={
                index === 0
                  ? "rounded-full border border-white/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-md p-2 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-2xl leading-none">{isMenuOpen ? "×" : "☰"}</span>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-rose-300 bg-[#ee6e73] px-4 pb-5 pt-3 shadow-sm lg:hidden">
          <div className="flex flex-col gap-2">
            {[...navItems, ...accountItems].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/95 transition hover:bg-white/10 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
