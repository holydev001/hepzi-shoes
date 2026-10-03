import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

async function sendConfirmation(order) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) return { sent: false, reason: "Mailgun env vars not configured" };
  const body=new URLSearchParams({from:process.env.MAILGUN_FROM||`Hephzi <orders@${process.env.MAILGUN_DOMAIN}>`,to:order.customer.email,subject:`Hephzi order ${order.id}`,text:`Thanks ${order.customer.name}! Your order total is $${order.total}. We’re getting it ready.`});
  const auth=Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64");
  const response=await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,{method:"POST",headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"},body});
  return {sent:response.ok};
}
export async function POST(request){try{const{customer,items,total}=await request.json();if(!customer?.email||!items?.length)return NextResponse.json({error:"Missing order details"},{status:400});const session=await getServerSession(authOptions);const payload={customer_name:customer.name,customer_email:customer.email,address:customer.address,city:customer.city,country:customer.country,total,items,account_email:session?.user?.email?.trim().toLowerCase()||null};let order={id:`local-${Date.now()}`,...payload};if(supabaseAdmin){const{data,error}=await supabaseAdmin.from("orders").insert(payload).select("id,customer_name,customer_email,total").single();if(error)throw error;order={...order,id:data.id,customer:{name:data.customer_name,email:data.customer_email}}}await sendConfirmation({id:order.id,total,customer:{name:customer.name,email:customer.email}});return NextResponse.json({orderId:order.id},{status:201})}catch(error){console.error("order error",error);return NextResponse.json({error:"Could not create order"},{status:500})}}
