"use client";

import { notFound, useParams } from "next/navigation";
import ProductDetail from "../../../components/ProductDetail";
import { getProduct } from "../../../lib/products";

export default function ProductPage() {
  const { slug } = useParams();
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product}/>;
}
