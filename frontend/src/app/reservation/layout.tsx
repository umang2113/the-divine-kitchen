import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservation | THE DIVINE | Book Your Table",
  description: "Experience the pinnacle of fine dining. Reserve your table at THE DIVINE and enjoy an unforgettable evening.",
  openGraph: {
    title: "Reserve a Table | THE DIVINE Kitchen",
    description: "Book your luxury dining experience online.",
    images: ["https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070"],
  },
};

export default function ReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
