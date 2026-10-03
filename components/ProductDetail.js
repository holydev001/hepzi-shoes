"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useCartStore from "../lib/cart";

export default function ProductDetail({ product }) {
  const { add, ready } = useCartStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [size, setSize] = useState("40");
  function addToBag() {
    if (status === "loading") return;
    if (!session) { router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`); return; }
    if (ready) add({ ...product, selectedSize: size });
  }
  return <main><div className="product-detail-header"><Link href="/products">← Back to all shoes</Link><Link href="/checkout">Bag →</Link></div><section className="product-detail"><div className="product-detail-image"><img src={product.image} alt={product.name}/></div><div className="product-detail-copy"><p className="kicker">{product.category} · {product.tag}</p><h1>{product.name}</h1><div className="detail-rating">★★★★★ <span>{product.rating} · Loved by customers</span></div><strong className="detail-price">${product.price}</strong><p className="detail-description">{product.description}</p><div className="size-row"><div><b>Select size</b><span>EU sizing</span></div><div className="size-buttons">{["38", "39", "40", "41", "42", "43"].map((option) => <button type="button" className={size === option ? "selected" : ""} onClick={() => setSize(option)} key={option}>{option}</button>)}</div></div><div className="colour-row"><b>Colour</b><div>{product.colors.map((colour) => <i key={colour} style={{ background: colour }}/>)}</div></div><button className="detail-add" disabled={status === "loading" || (Boolean(session) && !ready)} onClick={addToBag}>Add to bag <span>· ${product.price}</span></button><div className="detail-points">{product.details.map((detail) => <p key={detail}>✓ {detail}</p>)}</div></div></section></main>;
}
