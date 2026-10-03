"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useCartStore from "../lib/cart";

export default function ProductCard({ product }) {
  const { add, ready } = useCartStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  useEffect(() => { if (!added) return; const timer = window.setTimeout(() => setAdded(false), 1900); return () => window.clearTimeout(timer); }, [added]);
  function addToBag() {
    if (status === "loading") return;
    if (!session) { router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`); return; }
    if (!ready) return;
    add(product);
    setAdded(true);
  }
  const unavailable = status === "loading" || (Boolean(session) && !ready);
  return <article className="shoe-card"><div className="shoe-image"><span>{product.tag}</span><Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name}/></Link><button className={added ? "added-to-bag" : ""} disabled={unavailable} onClick={addToBag} aria-label={`Add ${product.name} to bag`} aria-live="polite">{added ? "Added to bag" : unavailable ? "Loading bag" : "Add to bag"} <strong>{added ? "✓" : "+"}</strong></button></div><div className="shoe-details"><p className="shoe-category">{product.category}</p><div><Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link><span className="rating">★★★★★ <small>{product.rating}</small></span></div><strong>${product.price}</strong></div></article>;
}
