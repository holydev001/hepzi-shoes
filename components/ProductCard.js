"use client";

import Link from "next/link";
import useCartStore from "../lib/cart";

export default function ProductCard({ product }) {
  const { add } = useCartStore();
  return <article className="shoe-card"><div className="shoe-image"><span>{product.tag}</span><Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name}/></Link><button onClick={() => add(product)} aria-label={`Add ${product.name} to bag`}>Add to bag <strong>+</strong></button></div><div className="shoe-details"><p className="shoe-category">{product.category}</p><div><Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link><span className="rating">★★★★★ <small>{product.rating}</small></span></div><strong>${product.price}</strong></div></article>;
}
