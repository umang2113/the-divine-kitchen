"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { getMenuItems } from "@/lib/api";
import { ShoppingBag } from "lucide-react";

export default function FeaturedDishes() {
  const [featuredDishes, setFeaturedDishes] = useState<any[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const data = await getMenuItems();
        const specials = data.filter((item: any) => item.isSpecial).slice(0, 3);
        
        if (specials.length > 0) {
          setFeaturedDishes(specials);
        } else {
          // Fallback to top 3 if no specials
          setFeaturedDishes(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching featured dishes:", err);
      }
    };
    fetchSpecials();
  }, []);

  return (
    <section className="py-24 bg-background relative" id="featured" ref={ref}>
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[var(--gold-primary)] tracking-[0.2em] uppercase text-xs md:text-sm font-semibold mb-4 block">
            Culinary Excellence
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-white">Signature Dishes</h2>
          <div className="w-24 h-1 bg-[var(--gold-primary)] mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {featuredDishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1, delay: index * 0.2, ease: [0.215, 0.61, 0.355, 1] }}
              className="group"
            >
              <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-[var(--surface-dark)] border-b border-[var(--surface-border)] group-hover:border-[var(--gold-primary)] transition-colors duration-500">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                
                {(dish.image || dish.imageUrl) ? (
                  <Image
                    src={dish.image || dish.imageUrl}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="text-[var(--gold-primary)] opacity-10 flex flex-col items-center">
                    <ShoppingBag size={64} />
                  </div>
                )}

                {dish.isSpecial && (
                  <span className="absolute top-4 right-4 z-20 bg-[var(--gold-primary)] text-black text-[8px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                    Signature
                  </span>
                )}
              </div>

              <div className="p-8 bg-[var(--surface-dark)] border-x border-b border-[var(--surface-border)] rounded-b-lg group-hover:border-[var(--gold-primary)] transition-all duration-500 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white group-hover:text-[var(--gold-primary)] transition-colors duration-500 leading-tight">
                    {dish.name}
                  </h3>
                  <span className="text-[var(--gold-primary)] font-serif font-bold text-2xl ml-4">
                    ₹{dish.price}
                  </span>
                </div>
                <p className="text-gray-300 font-medium text-sm mb-8 leading-relaxed line-clamp-2 h-10">
                  {dish.description}
                </p>
                <button 
                  onClick={() => addToCart(dish)}
                  className="w-full py-4 flex items-center justify-center gap-3 border border-[var(--surface-border)] hover:bg-[var(--gold-primary)] hover:text-black hover:border-[var(--gold-primary)] transition-all duration-500 text-[10px] tracking-[0.2em] uppercase font-bold text-white group/btn"
                >
                  <ShoppingBag size={14} />
                  Add to Order
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
