"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, ShoppingBag } from "lucide-react";
import { getMenuItems } from "@/lib/api";
import { useCart } from "@/context/CartContext";

// Mock Data for fallback
const menuCategories = ["All", "Starters", "Main Course", "Desserts", "Drinks", "Chef Specials"];

export default function MenuPage() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getMenuItems();
        // Fallback to mock data if backend fails
        if (data && data.length > 0) {
          setMenuItems(data);
        } else {
          setMenuItems([
            { id: 1, name: "Truffle Wagyu Ribeye", description: "A5 Japanese Wagyu, black truffle butter.", price: 185, category: "Main Course", isSpecial: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop" },
            { id: 2, name: "Lobster Thermidor", description: "Fresh Maine lobster, cognac cream sauce.", price: 120, category: "Main Course", isSpecial: true, image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=2090&auto=format&fit=crop" }
          ]);
        }
      } catch (e) {
        console.error("Error loading menu", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenu();
  }, []);

  const filteredMenu = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Menu Header */}
      <div className="relative pt-40 pb-20 px-6 md:px-12 bg-[var(--surface-dark)] border-b border-[var(--surface-border)]">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-gradient-gold mb-6"
          >
            Our Menu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto font-light text-lg"
          >
            A curated selection of extraordinary culinary delights, prepared with the world's finest ingredients.
          </motion.p>
        </div>
      </div>

      {/* Menu Filters & Search */}
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {menuCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm tracking-widest uppercase ${
                  activeCategory === category 
                    ? "border-[var(--gold-primary)] bg-[var(--gold-primary)] text-black font-semibold" 
                    : "border-[var(--surface-border)] text-gray-400 hover:border-[var(--gold-primary)] hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg overflow-hidden group hover:border-[var(--gold-primary)] transition-colors duration-300"
              >
                <div className="relative h-64 overflow-hidden bg-black/20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  {item.isSpecial && (
                    <span className="absolute top-4 right-4 z-20 bg-[var(--gold-primary)] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                      Chef Special
                    </span>
                  )}
                  {(item.image || item.imageUrl) ? (
                    <Image 
                      src={item.image || item.imageUrl} 
                      alt={item.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="text-[var(--gold-primary)] flex flex-col items-center opacity-20 group-hover:opacity-100 transition-opacity">
                      <ShoppingBag size={48} />
                      <span className="text-[10px] uppercase mt-2 tracking-widest">The Divine Selection</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif text-white group-hover:text-[var(--gold-primary)] transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[var(--gold-primary)] font-serif text-xl ml-4">
                      ₹{item.price}
                    </span>
                  </div>
                  <p className="text-gray-400 font-light text-sm mb-6 min-h-[40px]">
                    {item.description}
                  </p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full py-3 flex items-center justify-center gap-2 border border-[var(--surface-border)] hover:bg-[var(--gold-primary)] hover:text-black hover:border-[var(--gold-primary)] transition-all duration-300 text-sm tracking-widest uppercase font-semibold text-white group/btn"
                  >
                    <ShoppingBag size={16} />
                    Add to Order
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMenu.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No dishes found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
