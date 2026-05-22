import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
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
  title: "THE DIVINE | Luxury Dining Experience",
  description: "Experience world-class luxury dining, exquisite chef specials, and an unforgettable ambiance at The Divine.",
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
        <CartProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </CartProvider>
      </body>
    </html>
  );
}
