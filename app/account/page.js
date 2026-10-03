"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import UserIcon from "../../components/UserIcon";

function formatDate(value) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ displayName: "", imageUrl: "" });
  const [saveStatus, setSaveStatus] = useState("idle");
  useEffect(() => { if (!session) return; fetch("/api/account").then((response) => response.json()).then((result) => { if (result.profile) { setData(result); setForm({ displayName: result.profile.display_name || "", imageUrl: result.profile.image_url || "" }); } }).catch(() => setData({ error: "Could not load your account." })); }, [session]);
  async function save(event) { event.preventDefault(); setSaveStatus("saving"); const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const result = await response.json(); if (response.ok) { setData((current) => ({ ...current, profile: result.profile })); setSaveStatus("saved"); } else setSaveStatus("error"); }
  if (status === "loading") return <main><SiteHeader/><p className="account-loading-page">Loading your account…</p></main>;
  if (!session) return <main><SiteHeader/><section className="account-gate"><UserIcon size={42}/><p className="kicker">YOUR HEPHZI ACCOUNT</p><h1>Keep your details and orders close.</h1><p>Sign in with Google to edit your profile and revisit your orders.</p><button className="primary-action" onClick={() => signIn("google", { callbackUrl: "/account" })}>Continue with Google →</button></section></main>;
  const profile = data?.profile;
  const image = form.imageUrl || session.user?.image;
  return <main><SiteHeader/><section className="account-page"><div className="account-heading"><p className="kicker">YOUR HEPHZI ACCOUNT</p><h1>Hello, {profile?.display_name?.split(" ")[0] || session.user?.name?.split(" ")[0] || "there"}.</h1><p>Manage your profile and see every order connected to this account.</p></div><div className="account-layout"><form className="profile-card" onSubmit={save}><div className="profile-card-heading"><div className="account-avatar">{image ? <img src={image} alt="Profile"/> : <UserIcon size={36}/>}</div><div><h2>Profile settings</h2><p>{session.user?.email}</p></div></div><label>Display name<input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} required maxLength="80"/></label><label>Profile image URL<input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://example.com/your-photo.jpg"/></label><p className="profile-help">Use a public https image link, or leave this blank to use your Google photo.</p><button className="primary-action" disabled={saveStatus === "saving"}>{saveStatus === "saving" ? "Saving…" : "Save changes"}</button>{saveStatus === "saved" && <small className="saved-note">Your profile has been saved.</small>}{saveStatus === "error" && <small className="error-note">We could not save that change. Please try again.</small>}<button className="sign-out-button" type="button" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button></form><section className="order-history"><div><p className="kicker">ORDER HISTORY</p><h2>Your orders</h2></div>{data?.error ? <p className="order-empty">{data.error}</p> : !data ? <p className="order-empty">Loading your order history…</p> : data.orders.length ? <div className="orders-list">{data.orders.map((order) => <article className="order-card" key={order.id}><div><p>Order #{order.id.slice(0, 8).toUpperCase()}</p><span>{formatDate(order.created_at)}</span></div><strong>${Number(order.total).toFixed(2)}</strong><ul>{order.items.map((item) => <li key={`${order.id}-${item.id}`}>{item.name} <span>× {item.quantity}</span></li>)}</ul></article>)}</div> : <div className="order-empty"><p>You have not placed an order yet.</p><Link className="primary-action" href="/products">Explore the collection →</Link></div>}</section></div></section></main>;
}
