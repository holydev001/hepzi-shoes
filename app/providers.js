"use client";
import { SessionProvider } from "next-auth/react";
import CartSync from "../components/CartSync";

export default function Providers({ children }) { return <SessionProvider><CartSync/>{children}</SessionProvider>; }
