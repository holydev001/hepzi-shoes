"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useCartStore from "../../lib/cart";

function CheckoutHeader() {
  return <><div className="announcement">Secure checkout <span>·</span> Free delivery on orders over $150</div><header className="store-header"><Link href="/" className="wordmark">HEPHZI<span>.</span></Link><Link href="/products" className="bag-button">← Continue shopping</Link></header></>;
}

export default function Checkout() {
  const { cart, clear, changeQuantity, remove } = useCartStore();
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", country: "Nigeria" });
  const [status, setStatus] = useState("idle");
  const [emailSent, setEmailSent] = useState(true);
  useEffect(() => { if (session?.user) setForm((current) => ({ ...current, name: current.name || session.user.name || "", email: current.email || session.user.email || "" })); }, [session]);
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: form, items: cart, total }) });
    const result = await response.json();
    setStatus(response.ok ? "success" : "error");
    if (response.ok) { setEmailSent(result.emailSent); clear(); }
  }
  return <main><CheckoutHeader/><div className="checkout-shell"><div className="checkout-intro"><p className="kicker">SECURE CHECKOUT</p><h1>Almost<br/><em>yours.</em></h1><p>Review your bag, add your delivery details, and we’ll take care of the rest.</p></div><form className="checkout-form" onSubmit={submit}><h2>Delivery details</h2>{Object.keys(form).map((field) => <label key={field}>{field}<input required name={field} type={field === "email" ? "email" : "text"} value={form[field]} onChange={update} placeholder={field === "address" ? "12 Palm Street" : `Your ${field}`}/></label>)}<div className="order-summary"><h2>Your bag</h2>{cart.length ? cart.map((item) => <div className="summary-line cart-item" key={item.id}><div><b>{item.name}</b><span>${item.price} each{item.selectedSize ? ` · EU ${item.selectedSize}` : ""}</span></div><div className="quantity-control"><button type="button" onClick={() => changeQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button type="button" onClick={() => changeQuantity(item.id, 1)}>+</button><button className="remove-item" type="button" onClick={() => remove(item.id)}>Remove</button></div><strong>${item.price * item.quantity}</strong></div>) : <p>Your bag is empty. <Link href="/products">Shop the collection.</Link></p>}<div className="summary-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div></div><button className="primary-action checkout-submit" disabled={status === "loading" || !cart.length}>{status === "loading" ? "Placing order…" : `Place order · $${total.toFixed(2)}`}</button>{status === "success" && <p className="success-message">{emailSent ? "Order received. Your confirmation email is on its way." : "Order received. We could not confirm email delivery yet—check Mailgun’s logs."}</p>}{status === "error" && <p className="error-message">We couldn’t save your order. Please try again.</p>}</form></div></main>;
}
