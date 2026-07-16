import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path
        d="M6 8h12l-1.2 11H7.2L6 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CartFab() {
  const { itemCount } = useCart();

  return (
    <Link
      to="/cart"
      className="fixed bottom-8 left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 flex-col items-center justify-center rounded-full border border-[#ee6e73]/30 bg-white text-[#ee6e73] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:border-[#421F37]/50 dark:bg-zinc-900 dark:text-[#f0a8ad]"
      aria-label={`Open cart with ${itemCount} items`}
    >
      <BagIcon />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ee6e73] px-1.5 text-xs font-bold text-white dark:bg-[#421F37]">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">Cart</span>
    </Link>
  );
}
