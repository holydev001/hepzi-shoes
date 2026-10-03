"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import useCartStore from "../lib/cart";
import UserIcon from "./UserIcon";

function AccountControl() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  useEffect(() => { if (!session) { setProfile(null); return; } fetch("/api/account").then((response) => response.ok ? response.json() : null).then((result) => setProfile(result?.profile || null)).catch(() => setProfile(null)); }, [session]);
  if (status === "loading") return <span className="account-loading">•••</span>;
  if (!session) return <button className="nav-account" onClick={() => signIn("google", { callbackUrl: "/" })}><UserIcon/> <span>Sign in</span></button>;
  const firstName = profile?.display_name?.split(" ")[0] || session.user?.name?.split(" ")[0] || "Account";
  const image = profile?.image_url || session.user?.image;
  return <Link href="/account" className="nav-account signed-in">{image ? <img className="avatar avatar-image" src={image} alt=""/> : <span className="avatar"><UserIcon size={16}/></span>}<span>Hi, {firstName}</span></Link>;
}

export default function SiteHeader({ searchValue, onSearch }) {
  const [open, setOpen] = useState(false);
  const { cart } = useCartStore();
  const count = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  return <><div className="announcement">Free delivery on orders over $150 <span>·</span> Easy 30-day returns</div><header className="store-header"><Link href="/" className="wordmark">HEPHZI<span>.</span></Link><nav className="store-nav"><Link href="/products">Shop</Link><a href="/#edit">The edit</a></nav>{onSearch ? <label className="product-search"><span>⌕</span><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Search for shoes..." /></label> : <Link href="/products" className="browse-link">Browse products</Link>}<div className="header-actions"><Link className="bag-button" href="/checkout" aria-label="View bag">Bag <b>{count}</b></Link><AccountControl/><button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label="Open menu">{open ? "×" : "☰"}</button></div></header>{open && <nav className="mobile-nav"><Link href="/products" onClick={() => setOpen(false)}>Shop</Link><Link href="/account" onClick={() => setOpen(false)}>Account</Link><Link href="/checkout" onClick={() => setOpen(false)}>Bag ({count})</Link></nav>}</>;
}
