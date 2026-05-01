import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const goToHomeTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Categories", to: "/food-categories" },
    { label: "Foods", to: "/foods" },
    { label: "Contact", to: "#" },
  ];

  const accountItems = [
    { label: "Login", to: "/about" },
    { label: "Register", to: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rose-300 bg-[#ee6e73] text-white shadow-sm">
        <nav className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:justify-between lg:px-8">
        <Link
          to="/"
          className="brand-logo text-4xl leading-none tracking-wide text-white transition hover:text-rose-100 lg:text-3xl"
          onClick={goToHomeTop}
        >
          Restaurant
        </Link>

          <div className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            item.label === "Contact" ? (
              <button
                key={item.label}
                type="button"
                className="rounded-md px-2 py-1 text-white/95 transition-colors duration-200 hover:bg-[#e35f66] hover:text-white active:bg-[#d8565d]"
                onClick={() => setIsContactOpen(true)}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-md px-2 py-1 text-white/95 transition-colors duration-200 hover:bg-[#e35f66] hover:text-white active:bg-[#d8565d]"
                onClick={item.label === "Home" ? goToHomeTop : undefined}
              >
                {item.label}
              </Link>
            )
          ))}
          </div>

        <div className="hidden items-center gap-3 lg:flex">
          {accountItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.to}
              className={
                index === 0
                  ? "rounded-full border border-white/80 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                  : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="absolute left-4 inline-flex items-center rounded-md p-2 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-2xl leading-none">{isMenuOpen ? "×" : "☰"}</span>
        </button>
        </nav>

      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="relative h-full w-[250px] bg-white px-5 py-6 shadow-2xl">
            <div className="flex flex-col gap-2">
              {[...navItems, ...accountItems].map((item) =>
                item.label === "Contact" ? (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-base font-medium text-zinc-700 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 active:bg-rose-200 active:text-rose-800 focus-visible:bg-rose-50 focus-visible:text-zinc-800 [-webkit-tap-highlight-color:transparent]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsContactOpen(true);
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-md px-3 py-2 text-base font-medium text-zinc-700 transition-colors duration-200 hover:bg-rose-50 hover:text-zinc-800 active:bg-rose-200 active:text-rose-800 focus-visible:bg-rose-50 focus-visible:text-zinc-800 [-webkit-tap-highlight-color:transparent]"
                    onClick={item.label === "Home" ? goToHomeTop : () => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </aside>
        </div>
      )}

      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 px-4 py-12">
          <div className="mx-auto w-full max-w-3xl bg-white p-5 shadow-xl sm:p-7">
            <h2 className="text-4xl font-light text-zinc-800">Contact Info</h2>
            <p className="mt-4 text-sm text-zinc-700">
              You can contact us directly by calling to this number +8801605357646. Check the bottom Footer section of
              the website for more info.
            </p>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm font-medium uppercase text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200"
                onClick={() => setIsContactOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
