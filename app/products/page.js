"use client";

import { useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import SiteHeader from "../../components/SiteHeader";
import { products } from "../../lib/products";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const visible = useMemo(() => products.filter((product) => (category === "All" || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <main><SiteHeader searchValue={query} onSearch={setQuery}/><section className="products-hero"><p className="kicker">THE FULL COLLECTION</p><h1>Find your next<br/><em>favourite pair.</em></h1><p>Comfort-led shoes with enough character to carry every outfit.</p></section><section className="products-page"><div className="products-toolbar"><p>{visible.length} styles available</p><div>{["All", "Sneakers", "Loafers", "Sandals"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div><div className="catalog-grid products-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div>{!visible.length && <p className="empty-search">No pairs match that search. Try another category.</p>}</section></main>;
}
