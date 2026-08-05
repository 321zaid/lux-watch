"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  subtotal: number;
  isOpen: boolean;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (productId: string, variantName: string) => void;
  setQuantity: (productId: string, variantName: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

const CART_KEY = "astra-cart-v1";
const WISH_KEY = "astra-wishlist-v1";

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate cart + wishlist from localStorage on mount (client-only by design).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadJSON<CartItem[]>(CART_KEY, []));
    setWishlist(loadJSON<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.variantName === item.variantName
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variantName === item.variantName
            ? { ...i, quantity: Math.min(i.quantity + quantity, 9) }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, variantName: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantName === variantName))
    );
  }, []);

  const setQuantity = useCallback((productId: string, variantName: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => !(i.productId === productId && i.variantName === variantName))
        : prev.map((i) =>
            i.productId === productId && i.variantName === variantName
              ? { ...i, quantity: Math.min(quantity, 9) }
              : i
          )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const { cartCount, subtotal } = useMemo(() => {
    return {
      cartCount: cart.reduce((n, i) => n + i.quantity, 0),
      subtotal: cart.reduce((n, i) => n + i.priceCents * i.quantity, 0),
    };
  }, [cart]);

  const value = useMemo<StoreState>(
    () => ({
      cart,
      wishlist,
      cartCount,
      subtotal,
      isOpen,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [cart, wishlist, cartCount, subtotal, isOpen, addToCart, removeFromCart, setQuantity, clearCart, toggleWishlist, isWishlisted]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within CartProvider");
  return ctx;
}