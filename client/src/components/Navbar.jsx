import { Link } from "react-router-dom";

export default function Navbar() {
  const navItems = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Categories", to: "/food-categories" },
    { label: "Foods", to: "/foods" },
    { label: "Contact", to: "/about" },
    { label: "Login", to: "/about" },
    { label: "Register", to: "/about" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/20 bg-[#ee6e73] text-white shadow-sm">
      <nav className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-4 md:px-5">
        <Link to="/" className="brand-logo text-3xl leading-none text-white">
          Resturant
        </Link>
        <div className="hidden items-center gap-5 text-[10px] md:flex">
          {navItems.map((item) => (
            <Link key={item.label} to={item.to} className="transition hover:text-white/85">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
