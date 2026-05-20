"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, Clock, MapPin, Sparkles, Mail, Send, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export default function ReservationPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail("");
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-grow pt-32 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-6 space-y-6 text-left"
            >
              <span className="text-[var(--gold-primary)] tracking-[0.25em] uppercase text-xs md:text-sm font-semibold block">
                Exclusive Experience
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight">
                Table Booking <br />
                <span className="text-gradient-gold italic">Coming Soon</span>
              </h1>
              <p className="text-gray-400 font-light text-sm leading-relaxed max-w-md">
                We are currently crafting a premium digital reservation platform to offer you the ultimate convenience in planning your fine dining experience. 
              </p>
              
              <div className="space-y-4 pt-4 border-t border-white/10 max-w-sm">
                <div className="flex items-center gap-3 text-gray-400 text-xs">
                  <MapPin size={16} className="text-[var(--gold-primary)]" />
                  <span>Elite Ambiance & Prime Seating Map</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-xs">
                  <Clock size={16} className="text-[var(--gold-primary)]" />
                  <span>Real-time Instant Confirmations</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-xs">
                  <Sparkles size={16} className="text-[var(--gold-primary)]" />
                  <span>Customized Chef Special Requests</span>
                </div>
              </div>
            </motion.div>

            {/* Right Card Column */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-6"
            >
              <div className="bg-[var(--surface-dark)] p-8 md:p-10 border border-[var(--surface-border)] rounded-sm relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-light)] to-[var(--gold-dark)]" />
                
                {/* Background decorative glow */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-[var(--gold-primary)]/10 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-xl font-serif text-white mb-2 tracking-wider">BE THE FIRST TO KNOW</h3>
                <p className="text-gray-400 text-xs font-light mb-8">
                  Subscribe to receive early notifications and exclusive access to our priority booking calendar.
                </p>

                {subscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="py-10 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)] rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} className="text-[var(--gold-primary)]" />
                    </div>
                    <div>
                      <h4 className="text-white font-serif text-lg">You're on the list!</h4>
                      <p className="text-gray-500 text-xs mt-1">We'll notify you as soon as reservations are open.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} className="text-[var(--gold-primary)]" /> Email Address
                      </label>
                      <input 
                        id="email"
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full bg-background border border-[var(--surface-border)] p-3.5 text-white text-xs focus:outline-none focus:border-[var(--gold-primary)] transition-colors"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Notify Me <Send size={12} />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-4 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 italic uppercase tracking-wider">
                        For manual VIP bookings, please email: info@thedivinekitchen.com
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
