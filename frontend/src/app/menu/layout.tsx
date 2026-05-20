import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | THE DIVINE | Luxury Dining",
  description: "Explore our curated selection of extraordinary culinary delights, prepared with the world's finest ingredients by Michelin-star chefs.",
  openGraph: {
    title: "Menu | THE DIVINE Kitchen",
    description: "Experience the pinnacle of fine dining with our exclusive menu.",
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069"],
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
