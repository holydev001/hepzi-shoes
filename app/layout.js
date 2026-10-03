import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "Hephzi — Footwear with feeling", description: "Thoughtful footwear for the way you move." };

export default function RootLayout({ children }) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
