import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Experience from "@/components/home/Experience";
import FeaturedDishes from "@/components/home/FeaturedDishes";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Navbar />
      <Hero />
      <Experience />
      <FeaturedDishes />
      <Footer />
    </main>
  );
}
