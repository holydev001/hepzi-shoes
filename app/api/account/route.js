import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

async function requireAccount() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;
  return { email, name: session.user?.name || email.split("@")[0], image: session.user?.image || null };
}

function unavailable() {
  return NextResponse.json({ error: "Account data is not configured yet." }, { status: 503 });
}

export async function GET() {
  const account = await requireAccount();
  if (!account) return NextResponse.json({ error: "Sign in to access your account." }, { status: 401 });
  if (!supabaseAdmin) return unavailable();
  try {
    const { data: existing, error: profileError } = await supabaseAdmin.from("profiles").select("email,display_name,image_url").eq("email", account.email).maybeSingle();
    if (profileError) throw profileError;
    let profile = existing;
    if (!profile) {
      const { data, error } = await supabaseAdmin.from("profiles").insert({ email: account.email, display_name: account.name, image_url: account.image }).select("email,display_name,image_url").single();
      if (error) throw error;
      profile = data;
    }
    const { data: orders, error: orderError } = await supabaseAdmin.from("orders").select("id,total,items,created_at").eq("account_email", account.email).order("created_at", { ascending: false });
    if (orderError) throw orderError;
    return NextResponse.json({ profile, orders: orders || [] });
  } catch (error) {
    console.error("account GET error", error);
    return NextResponse.json({ error: "Could not load account data." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const account = await requireAccount();
  if (!account) return NextResponse.json({ error: "Sign in to update your account." }, { status: 401 });
  if (!supabaseAdmin) return unavailable();
  try {
    const body = await request.json();
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!displayName || displayName.length > 80) return NextResponse.json({ error: "Use a name between 1 and 80 characters." }, { status: 400 });
    if (imageUrl && !/^https:\/\//i.test(imageUrl)) return NextResponse.json({ error: "Profile image must use a secure https URL." }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("profiles").upsert({ email: account.email, display_name: displayName, image_url: imageUrl || null, updated_at: new Date().toISOString() }, { onConflict: "email" }).select("email,display_name,image_url").single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("account PATCH error", error);
    return NextResponse.json({ error: "Could not save your profile." }, { status: 500 });
  }
}
