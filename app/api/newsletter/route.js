import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeNewsletterEmail() {
  return {
    text: [
      "HEPHZI — YOU'RE ON THE LIST",
      "",
      "Thanks for joining us.",
      "You now have first access to new drops, considered edits, and the occasional good thing from Hephzi.",
      "",
      "Footwear with feeling. Made for the way you move.",
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="x-apple-disable-message-reformatting"/>
    <title>You’re on the list — Hephzi</title>
  </head>
  <body style="margin:0;padding:0;background:#efedeb;color:#121212;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">You’re on the Hephzi list. New drops and considered edits are heading your way.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#efedeb;width:100%;">
      <tr><td style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;margin:0 auto;background:#ffffff;">
          <tr><td style="padding:25px 32px;background:#111111;color:#ffffff;font-size:19px;font-weight:800;letter-spacing:4px;line-height:1;">HEPHZI<span style="color:#c8ef46;">.</span></td></tr>
          <tr><td style="padding:48px 32px 40px;">
            <p style="margin:0 0 14px;color:#6b6a67;font-size:11px;font-weight:700;letter-spacing:1.6px;">THE GOOD STUFF</p>
            <h1 style="margin:0 0 18px;color:#121212;font-size:36px;line-height:1.04;letter-spacing:-1.3px;">You’re on the list.</h1>
            <p style="margin:0;color:#5e5d58;font-size:16px;line-height:1.6;">Thanks for joining us. You’ll be first to hear about new drops, considered edits, and the occasional good thing from Hephzi.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;"><tr><td style="border-radius:999px;background:#d5ff00;"><a href="https://hepzi-shoes.vercel.app/products" style="display:inline-block;padding:14px 22px;color:#121212;font-size:13px;font-weight:700;text-decoration:none;">Explore the collection →</a></td></tr></table>
          </td></tr>
          <tr><td style="padding:24px 32px;background:#111111;color:#ffffff;"><p style="margin:0 0 7px;font-size:14px;font-weight:700;">Footwear with feeling.</p><p style="margin:0;color:#b9b9b6;font-size:12px;line-height:1.5;">Made for the way you move.</p></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
  };
}

async function sendNewsletterConfirmation(email) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) return false;

  const message = makeNewsletterEmail();
  const form = new FormData();
  form.set(
    "from",
    process.env.MAILGUN_FROM ||
      `Hephzi <postmaster@${process.env.MAILGUN_DOMAIN}>`,
  );
  form.set("to", email);
  form.set("subject", "You’re on the list · Hephzi");
  form.set("text", message.text);
  form.set("html", message.html);
  form.set("o:tag", "newsletter-confirmation");
  if (process.env.MAILGUN_REPLY_TO)
    form.set("h:Reply-To", process.env.MAILGUN_REPLY_TO);

  const token = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString(
    "base64",
  );
  const baseUrl = (
    process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net"
  ).replace(/\/$/, "");
  const response = await fetch(
    `${baseUrl}/v3/${process.env.MAILGUN_DOMAIN}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${token}` },
      body: form,
    },
  );

  if (response.ok) return true;
  console.error(
    `Newsletter confirmation failed: ${response.status} ${(await response.text()).slice(0, 500)}`,
  );
  return false;
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!emailPattern.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "The newsletter is not configured yet. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        { email: normalizedEmail, subscribed_at: new Date().toISOString() },
        { onConflict: "email" },
      );

    if (error) {
      console.error("Newsletter subscription failed", error);
      return NextResponse.json(
        { error: "We could not add you to the list. Please try again." },
        { status: 500 },
      );
    }

    const emailSent = await sendNewsletterConfirmation(normalizedEmail);
    return NextResponse.json(
      {
        message: emailSent
          ? "You’re on the list. Check your inbox for a welcome note."
          : "You’re on the list. Your confirmation email could not be sent just yet.",
        emailSent,
      },
      { status: emailSent ? 201 : 202 },
    );
  } catch {
    return NextResponse.json(
      { error: "Please try again with a valid email address." },
      { status: 400 },
    );
  }
}
