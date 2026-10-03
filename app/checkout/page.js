"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useCartStore from "../../lib/cart";

function CheckoutHeader() {
  return <><div className="announcement">Secure checkout <span>·</span> Free delivery on orders over $150</div><header className="store-header"><Link href="/" className="wordmark">HEPHZI<span>.</span></Link><Link href="/products" className="bag-button">← Continue shopping</Link></header></>;
}

export default function Checkout() {
  const { cart, clear, changeQuantity, remove, ready } = useCartStore();
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", country: "Nigeria" });
  const [paymentMethod] = useState("pay_on_delivery");
  const [status, setStatus] = useState("idle");
  const [emailSent, setEmailSent] = useState(true);

  useEffect(() => {
    if (session?.user) setForm((current) => ({ ...current, name: current.name || session.user.name || "", email: current.email || session.user.email || "" }));
  }, [session]);

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    if (!cart.length) return;
    setStatus("loading");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items: cart, total, paymentMethod }),
      });
      const result = await response.json();
      setStatus(response.ok ? "success" : "error");
      if (response.ok) {
        setEmailSent(result.emailSent);
        clear();
      }
    } catch {
      setStatus("error");
    }
  }

  return <main><CheckoutHeader/><div className="checkout-shell"><aside className="checkout-intro"><p className="kicker">SECURE CHECKOUT</p><h1>Almost<br/><em>yours.</em></h1><p>Review your bag, choose how you’ll pay, then add your delivery details.</p><div className="checkout-trust"><span>✓</span><p><b>Order confirmation</b><br/>A detailed receipt will be sent to your email.</p></div></aside><form className="checkout-form" onSubmit={submit}>
    <section className="checkout-section">
      <div className="section-heading"><div><p className="kicker">01</p><h2>Delivery details</h2></div><span>Where your order is going</span></div>
      <div className="checkout-fields">
        <label className="checkout-field">Full name<input required name="name" type="text" value={form.name} onChange={update} placeholder="Your name"/></label>
        <label className="checkout-field">Email<input required name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com"/></label>
        <label className="checkout-field checkout-field-wide">Address<input required name="address" type="text" value={form.address} onChange={update} placeholder="12 Palm Street"/></label>
        <label className="checkout-field">City<input required name="city" type="text" value={form.city} onChange={update} placeholder="Your city"/></label>
        <label className="checkout-field">Country<input required name="country" type="text" value={form.country} onChange={update}/></label>
      </div>
    </section>
    <section className="checkout-section payment-section">
      <div className="section-heading"><div><p className="kicker">02</p><h2>Payment method</h2></div><span>Choose one option</span></div>
      <div className="payment-options" role="radiogroup" aria-label="Payment method">
        <label className="payment-option selected">
          <input checked name="paymentMethod" readOnly type="radio" value="pay_on_delivery"/>
          <span className="payment-radio" aria-hidden="true"/>
          <span className="payment-copy"><b>Pay on delivery</b><small>Pay once your order arrives at your delivery address.</small></span>
          <span className="payment-badge">Available</span>
        </label>
      </div>
      <p className="payment-note">Paystack is temporarily unavailable. You will pay when your order is delivered.</p>
    </section>
    <section className="order-summary">
      <div className="section-heading"><div><p className="kicker">03</p><h2>Your bag</h2></div><Link href="/products">Edit bag</Link></div>
      {!ready ? <p className="empty-bag">Loading your saved bag…</p> : cart.length ? cart.map((item) => <div className="summary-line cart-item" key={item.id}><div><b>{item.name}</b><span>${item.price} each{item.selectedSize ? ` · EU ${item.selectedSize}` : ""}</span></div><div className="quantity-control"><button aria-label={`Remove one ${item.name}`} type="button" onClick={() => changeQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button aria-label={`Add one ${item.name}`} type="button" onClick={() => changeQuantity(item.id, 1)}>+</button><button className="remove-item" type="button" onClick={() => remove(item.id)}>Remove</button></div><strong>${(item.price * item.quantity).toFixed(2)}</strong></div>) : <p className="empty-bag">Your bag is empty. <Link href="/products">Shop the collection.</Link></p>}
      <div className="summary-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
    </section>
    <button className="primary-action checkout-submit" disabled={status === "loading" || !ready || !cart.length}>{status === "loading" ? "Confirming your order…" : `Confirm order · $${total.toFixed(2)}`}</button>
    <p className="checkout-legal">By confirming, you agree to place this order using your selected payment method.</p>
    {status === "success" && <p className="success-message">{emailSent ? "Order received. Your detailed confirmation email is on its way." : "Order received. We could not confirm email delivery yet—check Mailgun’s logs."}</p>}
    {status === "error" && <p className="error-message">We couldn’t save your order. Please try again.</p>}
  </form></div></main>;
}
