"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop" 
            alt="About Hero" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif text-gradient-gold mb-4"
          >
            The Heritage
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 tracking-[0.3em] uppercase text-sm"
          >
            A Journey of Culinary Excellence
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6 md:px-12 container mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
              Where Elegance <br /> Meets <span className="text-[var(--gold-primary)] italic">Flavor</span>
            </h2>
            <div className="space-y-6 text-gray-400 font-light leading-relaxed text-lg">
              <p>
                Founded in 1998, THE DIVINE was born out of a passion for redefining the fine-dining experience. Our vision was simple yet ambitious: to create a sanctuary where the world's most exquisite ingredients meet unparalleled service.
              </p>
              <p>
                Every dish served at THE DIVINE is a masterpiece, crafted by our world-renowned chefs who bring decades of experience from the culinary capitals of Paris, Tokyo, and New York.
              </p>
              <p>
                We don't just serve food; we curate memories. From the gentle glow of our golden chandeliers to the intricate textures of our signature truffle dishes, every detail is designed to transport you to a world of absolute luxury.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="aspect-[4/5] border border-[var(--gold-primary)] p-4 relative">
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
                alt="Chef at work" 
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-[var(--surface-dark)] p-8 border border-[var(--surface-border)] hidden md:block">
                <p className="text-5xl font-serif text-[var(--gold-primary)] mb-2">25+</p>
                <p className="text-gray-400 uppercase tracking-widest text-xs">Years of Mastery</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-[var(--surface-dark)] py-24 px-6 border-y border-[var(--surface-border)]">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-12 uppercase tracking-widest">Our Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-[var(--gold-primary)] font-serif text-2xl mb-4">Purity</h3>
              <p className="text-gray-400 text-sm font-light">We source only the freshest, organic, and ethically raised ingredients from around the globe.</p>
            </div>
            <div>
              <h3 className="text-[var(--gold-primary)] font-serif text-2xl mb-4">Innovation</h3>
              <p className="text-gray-400 text-sm font-light">While we respect tradition, we constantly push boundaries to create unique flavor profiles.</p>
            </div>
            <div>
              <h3 className="text-[var(--gold-primary)] font-serif text-2xl mb-4">Service</h3>
              <p className="text-gray-400 text-sm font-light">Our goal is to anticipate your every need before you even realize it yourself.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
