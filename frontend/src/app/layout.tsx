import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { PWAProvider } from "@/context/PWAContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Divine Kitchen",
  description: "Enterprise Restaurant Management",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
      </head>
      <body className={`${playfair.variable} ${inter.variable} min-h-screen bg-background text-foreground antialiased`}>
        <PWAProvider>
          <CartProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </CartProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
