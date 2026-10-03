import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

async function sendConfirmation(order) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) return { sent: false, reason: "Mailgun is not configured" };
  const form = new FormData();
  form.set("from", process.env.MAILGUN_FROM || `Hephzi <postmaster@${process.env.MAILGUN_DOMAIN}>`);
  form.set("to", order.customer.email);
  form.set("subject", `Your Hephzi order ${order.id.slice(0, 8).toUpperCase()}`);
  form.set("text", `Thanks ${order.customer.name}! We received your Hephzi order for $${order.total}. We’ll let you know when it is on its way.`);
  form.set("html", `<main style="font-family:Arial,sans-serif;color:#111;max-width:560px;margin:auto"><p style="font-size:12px;letter-spacing:2px">HEPHZI</p><h1>Thanks, ${escapeHtml(order.customer.name)}.</h1><p>We received your order and are getting your pair ready.</p><p><strong>Order:</strong> #${order.id.slice(0, 8).toUpperCase()}<br/><strong>Total:</strong> $${order.total}</p><p style="margin-top:32px">Footwear with feeling.</p></main>`);
  form.set("o:tag", "order-confirmation");
  const token = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64");
  const baseUrl = (process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/v3/${process.env.MAILGUN_DOMAIN}/messages`, { method: "POST", headers: { Authorization: `Basic ${token}` }, body: form });
  if (response.ok) return { sent: true };
  const details = (await response.text()).slice(0, 500);
  console.error("Mailgun confirmation failed", { status: response.status, details });
  return { sent: false, reason: "Mailgun did not accept the message" };
}

export async function POST(request) {
  try {
    const { customer, items, total } = await request.json();
    if (!customer?.name || !customer?.email || !items?.length || !Number.isFinite(Number(total))) return NextResponse.json({ error: "Missing or invalid order details" }, { status: 400 });
    if (!supabaseAdmin) return NextResponse.json({ error: "The store database is not configured." }, { status: 503 });
    const session = await getServerSession(authOptions);
    const payload = { customer_name: customer.name.trim(), customer_email: customer.email.trim().toLowerCase(), address: customer.address?.trim(), city: customer.city?.trim(), country: customer.country?.trim(), total: Number(total), items, account_email: session?.user?.email?.trim().toLowerCase() || null };
    const { data, error } = await supabaseAdmin.from("orders").insert(payload).select("id,customer_name,customer_email,total").single();
    if (error) throw error;
    const confirmation = await sendConfirmation({ id: data.id, total: data.total, customer: { name: data.customer_name, email: data.customer_email } });
    return NextResponse.json({ orderId: data.id, emailSent: confirmation.sent }, { status: 201 });
  } catch (error) {
    console.error("order error", error);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
