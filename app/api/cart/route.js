import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

async function requireAccount() {
  const session = await getServerSession(authOptions);
  return session?.user?.email?.trim().toLowerCase() || null;
}

function unavailable() {
  return NextResponse.json({ error: "The cart database is not configured." }, { status: 503 });
}

function normaliseItems(items) {
  if (!Array.isArray(items) || items.length > 30) return null;
  const normalised = items.map((item) => {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string" || !Number.isFinite(Number(item.price))) return null;
    return {
      id: item.id.slice(0, 120),
      slug: typeof item.slug === "string" ? item.slug.slice(0, 120) : item.id.slice(0, 120),
      name: item.name.slice(0, 160),
      category: typeof item.category === "string" ? item.category.slice(0, 80) : "Footwear",
      price: Number(item.price),
      image: typeof item.image === "string" ? item.image.slice(0, 2000) : "",
      rating: typeof item.rating === "string" ? item.rating.slice(0, 20) : "",
      tag: typeof item.tag === "string" ? item.tag.slice(0, 80) : "",
      selectedSize: typeof item.selectedSize === "string" ? item.selectedSize.slice(0, 12) : undefined,
      quantity: Math.min(10, Math.max(1, Number(item.quantity) || 1)),
    };
  });
  return normalised.every(Boolean) ? normalised : null;
}

export async function GET() {
  const email = await requireAccount();
  if (!email) return NextResponse.json({ error: "Sign in to access your bag." }, { status: 401 });
  if (!supabaseAdmin) return unavailable();

  try {
    const { data, error } = await supabaseAdmin.from("carts").select("items").eq("account_email", email).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ items: data?.items || [] });
  } catch (error) {
    console.error("cart GET error", error);
    return NextResponse.json({ error: "Could not load your bag." }, { status: 500 });
  }
}

export async function PUT(request) {
  const email = await requireAccount();
  if (!email) return NextResponse.json({ error: "Sign in to update your bag." }, { status: 401 });
  if (!supabaseAdmin) return unavailable();

  try {
    const { items } = await request.json();
    const normalised = normaliseItems(items);
    if (!normalised) return NextResponse.json({ error: "Invalid cart items." }, { status: 400 });
    const { error } = await supabaseAdmin.from("carts").upsert({ account_email: email, items: normalised, updated_at: new Date().toISOString() }, { onConflict: "account_email" });
    if (error) throw error;
    return NextResponse.json({ items: normalised });
  } catch (error) {
    console.error("cart PUT error", error);
    return NextResponse.json({ error: "Could not save your bag." }, { status: 500 });
  }
}
