import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getOrderLines(items) {
  return items.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.price) || 0;

    return {
      name: String(item.name || "Hephzi footwear"),
      quantity,
      price,
      size: item.selectedSize ? String(item.selectedSize) : null,
      lineTotal: price * quantity,
    };
  });
}

function makeTextReceipt(order, lines, reference) {
  const deliveryLines = [order.delivery.address, order.delivery.city, order.delivery.country].filter(Boolean);
  const itemLines = lines.map((item) => `- ${item.name}${item.size ? ` (EU ${item.size})` : ""} × ${item.quantity} — ${formatMoney(item.lineTotal)}`);

  return [
    `HEPHZI — ORDER CONFIRMED`,
    "",
    `Thanks, ${order.customer.name}. We received your order and are getting your pair ready.`,
    `Order reference: #${reference}`,
    "",
    "YOUR ORDER",
    ...itemLines,
    `Order total: ${formatMoney(order.total)}`,
    "",
    "DELIVERY TO",
    ...deliveryLines,
    "",
    "We'll send another update when your order is on its way.",
    "Footwear with feeling.",
  ].join("\n");
}

function makeHtmlReceipt(order, lines, reference) {
  const deliveryLines = [order.delivery.address, order.delivery.city, order.delivery.country]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br/>");
  const itemRows = lines.map((item) => `
    <tr>
      <td style="padding:18px 0;border-bottom:1px solid #e7e5e2;vertical-align:top;">
        <p style="margin:0 0 5px;font-size:15px;font-weight:700;color:#121212;line-height:1.3;">${escapeHtml(item.name)}</p>
        <p style="margin:0;color:#6b6a67;font-size:13px;line-height:1.4;">${item.size ? `EU ${escapeHtml(item.size)} · ` : ""}Qty ${item.quantity} · ${formatMoney(item.price)} each</p>
      </td>
      <td style="padding:18px 0 18px 16px;border-bottom:1px solid #e7e5e2;vertical-align:top;text-align:right;font-size:15px;font-weight:700;color:#121212;white-space:nowrap;">${formatMoney(item.lineTotal)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="x-apple-disable-message-reformatting"/>
    <title>Order confirmed — Hephzi</title>
  </head>
  <body style="margin:0;padding:0;background:#efedeb;color:#121212;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your Hephzi order #${reference} is confirmed. We’re getting your pair ready.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#efedeb;margin:0;padding:0;width:100%;">
      <tr>
        <td style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;margin:0 auto;background:#ffffff;">
            <tr>
              <td style="padding:25px 32px;background:#111111;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-size:19px;font-weight:800;letter-spacing:4px;line-height:1;">HEPHZI<span style="color:#c8ef46;">.</span></td>
                    <td style="text-align:right;color:#c8ef46;font-size:10px;font-weight:700;letter-spacing:1.5px;">ORDER CONFIRMED</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:38px 32px 30px;">
                <p style="margin:0 0 12px;color:#5e5d58;font-size:11px;font-weight:700;letter-spacing:1.6px;">THANK YOU FOR YOUR ORDER</p>
                <h1 style="margin:0 0 14px;color:#121212;font-size:34px;line-height:1.08;letter-spacing:-1px;">You’re all set, ${escapeHtml(order.customer.name)}.</h1>
                <p style="margin:0;color:#5e5d58;font-size:16px;line-height:1.55;">We received your order and are getting your pair ready. We’ll send another email when it’s on its way.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f2ef;border-left:4px solid #c8ef46;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 4px;color:#6b6a67;font-size:10px;font-weight:700;letter-spacing:1.4px;">ORDER REFERENCE</p>
                      <p style="margin:0;color:#121212;font-size:16px;font-weight:800;letter-spacing:.8px;">#${reference}</p>
                    </td>
                    <td style="padding:16px 18px;text-align:right;vertical-align:bottom;">
                      <p style="margin:0;color:#121212;font-size:16px;font-weight:800;">${formatMoney(order.total)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 0;">
                <p style="margin:0 0 14px;color:#121212;font-size:12px;font-weight:800;letter-spacing:1.5px;">YOUR ORDER</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${itemRows}
                  <tr>
                    <td style="padding:20px 0 0;color:#121212;font-size:16px;font-weight:800;">Order total</td>
                    <td style="padding:20px 0 0 16px;text-align:right;color:#121212;font-size:18px;font-weight:800;white-space:nowrap;">${formatMoney(order.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 38px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e7e5e2;padding-top:28px;">
                  <tr>
                    <td style="vertical-align:top;">
                      <p style="margin:0 0 8px;color:#121212;font-size:12px;font-weight:800;letter-spacing:1.5px;">DELIVERY TO</p>
                      <p style="margin:0;color:#5e5d58;font-size:14px;line-height:1.55;">${deliveryLines || "Delivery address to be confirmed"}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;background:#111111;color:#ffffff;">
                <p style="margin:0 0 7px;font-size:14px;font-weight:700;">Footwear with feeling.</p>
                <p style="margin:0;color:#b9b9b6;font-size:12px;line-height:1.5;">Questions about your order? Reply to this email and we’ll be glad to help.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendConfirmation(order) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) return { sent: false, reason: "Mailgun is not configured" };
  const reference = order.id.slice(0, 8).toUpperCase();
  const lines = getOrderLines(order.items);
  const form = new FormData();
  form.set("from", process.env.MAILGUN_FROM || `Hephzi <postmaster@${process.env.MAILGUN_DOMAIN}>`);
  form.set("to", order.customer.email);
  form.set("subject", `Order confirmed · Hephzi #${reference}`);
  form.set("text", makeTextReceipt(order, lines, reference));
  form.set("html", makeHtmlReceipt(order, lines, reference));
  form.set("o:tag", "order-confirmation");
  if (process.env.MAILGUN_REPLY_TO) form.set("h:Reply-To", process.env.MAILGUN_REPLY_TO);
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
    const { customer, items, total, paymentMethod = "paystack" } = await request.json();
    if (!customer?.name || !customer?.email || !items?.length || !Number.isFinite(Number(total)) || paymentMethod !== "paystack") return NextResponse.json({ error: "Missing or invalid order details" }, { status: 400 });
    if (!supabaseAdmin) return NextResponse.json({ error: "The store database is not configured." }, { status: 503 });
    const session = await getServerSession(authOptions);
    const payload = { customer_name: customer.name.trim(), customer_email: customer.email.trim().toLowerCase(), address: customer.address?.trim(), city: customer.city?.trim(), country: customer.country?.trim(), total: Number(total), items, payment_method: paymentMethod, account_email: session?.user?.email?.trim().toLowerCase() || null };
    const { data, error } = await supabaseAdmin.from("orders").insert(payload).select("id,customer_name,customer_email,total").single();
    if (error) throw error;
    const confirmation = await sendConfirmation({
      id: data.id,
      total: data.total,
      customer: { name: data.customer_name, email: data.customer_email },
      items,
      delivery: { address: payload.address, city: payload.city, country: payload.country },
    });
    return NextResponse.json({ orderId: data.id, emailSent: confirmation.sent }, { status: 201 });
  } catch (error) {
    console.error("order error", error);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
