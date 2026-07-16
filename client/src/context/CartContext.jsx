import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_FOOD_PRICE } from "../lib/orderTotals";

const CartContext = createContext(null);
const STORAGE_KEY = "restaurantCart";

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((food) => {
    const id = String(food._id ?? food.fname ?? "");
    if (!id) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...prev,
        {
          id,
          fname: food.fname || "Food item",
          price: Number(food.price) > 0 ? Number(food.price) : DEFAULT_FOOD_PRICE,
          image: food.image || "/images/Snacks.jpg",
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((item) => item.id !== id);
      return prev.map((item) => (item.id === id ? { ...item, quantity } : item));
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, itemCount }),
    [items, addItem, updateQuantity, removeItem, clearCart, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
