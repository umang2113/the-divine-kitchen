"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-[var(--surface-dark)] overflow-hidden" ref={ref}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-sm overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
                alt="Chef preparing luxury food"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 border-[10px] border-[var(--surface-dark)]" />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[var(--gold-primary)] z-[-1]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2 space-y-6 lg:space-y-8"
          >
            <span className="text-[var(--gold-primary)] tracking-[0.2em] uppercase text-xs md:text-sm font-semibold block">
              The Art of Fine Dining
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
              A Symphony of <br />
              <span className="text-gradient-gold italic">Flavors</span>
            </h2>
            <p className="text-gray-400 font-light text-lg leading-relaxed">
              At The Divine, we believe that dining is an art form. Our Michelin-starred chefs meticulously craft each dish to not only tantalize your taste buds but to create a visually stunning masterpiece.
            </p>
            <p className="text-gray-400 font-light text-lg leading-relaxed">
              We source only the rarest and finest ingredients from around the world, ensuring that every bite tells a story of luxury, passion, and perfection.
            </p>

            <div className="pt-6">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Signature_of_Gordon_Ramsay.svg/1200px-Signature_of_Gordon_Ramsay.svg.png" 
                alt="Chef Signature" 
                className="h-16 opacity-50 invert brightness-0 filter contrast-200 object-contain object-left" 
              />
              <p className="text-white font-serif mt-2">Executive Chef</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
