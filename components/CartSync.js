"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useCartStore from "../lib/cart";

export default function CartSync() {
  const { data: session, status } = useSession();
  const { cart, clear, setCart, setLoading } = useCartStore();
  const activeAccount = useRef(null);
  const lastSaved = useRef("[]");
  const email = session?.user?.email?.trim().toLowerCase();

  useEffect(() => {
    if (status === "loading") return;
    if (!email) {
      activeAccount.current = null;
      lastSaved.current = "[]";
      clear();
      return;
    }

    let cancelled = false;
    activeAccount.current = null;
    setLoading();
    fetch("/api/cart")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load bag")))
      .then((data) => {
        if (cancelled) return;
        const savedCart = Array.isArray(data.items) ? data.items : [];
        lastSaved.current = JSON.stringify(savedCart);
        activeAccount.current = email;
        setCart(savedCart);
      })
      .catch(() => {
        if (!cancelled) setCart([]);
      });

    return () => { cancelled = true; };
  }, [email, status, clear, setCart, setLoading]);

  useEffect(() => {
    if (!email || activeAccount.current !== email) return;
    const serialized = JSON.stringify(cart);
    if (serialized === lastSaved.current) return;

    const timer = window.setTimeout(async () => {
      const response = await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart }) });
      if (response.ok) lastSaved.current = serialized;
    }, 350);

    return () => window.clearTimeout(timer);
  }, [cart, email]);

  return null;
}
