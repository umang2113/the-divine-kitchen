"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax effect for the background
      gsap.to(".bg-image", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Staggered text animation
      gsap.fromTo(
        ".animate-text",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: "power4.out",
          delay: 0.5,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image/Video Overlay */}
      <div className="absolute inset-0 z-0 bg-image">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Kitchen Interior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div ref={textRef} className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
        <p className="animate-text text-[var(--gold-primary)] tracking-[0.3em] uppercase text-sm md:text-base mb-6 font-semibold">
          A Culinary Masterpiece
        </p>
        
        <h1 className="animate-text font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">
          Experience <br className="hidden md:block" />
          <span className="text-gradient-gold italic">The Divine</span>
        </h1>
        
        <p className="animate-text text-gray-300 max-w-2xl mx-auto text-lg md:text-xl font-light mb-12">
          Where passion meets perfection. Indulge in an unforgettable fine dining experience crafted by Michelin-star chefs.
        </p>
        
        <div className="animate-text flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/reservation"
            className="px-8 py-4 bg-[var(--gold-primary)] text-black uppercase tracking-widest text-sm font-bold hover:bg-white transition-colors duration-300 w-full sm:w-auto"
          >
            Reserve a Table
          </Link>
          <Link
            href="/menu"
            className="px-8 py-4 border border-[var(--gold-primary)] text-[var(--gold-primary)] uppercase tracking-widest text-sm font-bold hover:bg-[var(--gold-primary)] hover:text-black transition-all duration-300 w-full sm:w-auto glass-gold"
          >
            Explore Menu
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[var(--gold-primary)] text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--gold-primary)] to-transparent" />
      </div>
    </section>
  );
}
