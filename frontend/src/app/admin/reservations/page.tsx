"use client";

import { motion } from "framer-motion";
import { CalendarClock, Sparkles, AlertCircle } from "lucide-react";

export default function AdminReservations() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl"
    >
      <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-12 text-center rounded-sm relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-light)] to-[var(--gold-dark)]" />
        
        {/* Background decorative glow */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-[var(--gold-primary)]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <CalendarClock size={36} className="text-[var(--gold-primary)]" />
        </div>

        <span className="text-[var(--gold-primary)] tracking-[0.25em] uppercase text-xs font-semibold block mb-2">
          Feature Status
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-white uppercase tracking-widest mb-4">
          Reservations <span className="text-gradient-gold italic">Coming Soon</span>
        </h2>
        <p className="text-gray-400 font-light text-sm leading-relaxed max-w-xl mx-auto mb-8">
          The table booking and reservation management system is currently set to "Coming Soon". Active customer table bookings are disabled on the frontend. Once the reservation platform is fully launched, you will be able to manage guest tables, reservation lists, and walk-in statuses here.
        </p>

        <div className="h-[1px] bg-[var(--surface-border)] w-full my-8" />

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-xs text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--gold-primary)]" />
            <span>Frontend marked as Coming Soon</span>
          </div>
          <span className="hidden sm:inline text-gray-700">|</span>
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-[var(--gold-primary)]" />
            <span>Public booking forms disabled</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
