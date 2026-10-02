"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
export default function Login(){return <main className="login-shell"><Link href="/" className="brand"><span className="brand-mark">H.</span><span>HEPHZI</span></Link><div className="login-card"><p className="eyebrow">WELCOME IN</p><h1>Your pair<br/><em>awaits.</em></h1><p>Sign in to keep your orders and checkout details close.</p><button className="button button-dark" onClick={()=>signIn("google",{callbackUrl:"/"})}>Continue with Google <span>↗</span></button><small>Google OAuth is configured through Google Cloud Console.</small></div></main>}
