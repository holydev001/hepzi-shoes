"use client";

import { create } from "zustand";

const useCartStore = create((set) => ({
  cart: [],
  ready: false,
  setLoading: () => set({ cart: [], ready: false }),
  setCart: (cart) => set({ cart: Array.isArray(cart) ? cart : [], ready: true }),
  add: (product) => set((state) => {
    const found = state.cart.find((item) => item.id === product.id);
    return { cart: found ? state.cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...state.cart, { ...product, quantity: 1 }] };
  }),
  changeQuantity: (id, delta) => set((state) => ({ cart: state.cart.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item) })),
  remove: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
  clear: () => set({ cart: [], ready: false }),
}));

export default useCartStore;
