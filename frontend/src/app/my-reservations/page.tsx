"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getMyReservations } from "@/lib/api";
import { MapPin, Calendar, Clock, Receipt, X } from "lucide-react";
import clsx from "clsx";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getMyReservations();
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error("Data is not an array:", data);
        setReservations([]);
      }
    } catch (error: any) {
      console.error("Error fetching history:", error);
      if (error.message?.toLowerCase().includes("authorized") || error.message?.toLowerCase().includes("token")) {
        localStorage.removeItem("token");
        window.location.href = "/login?redirect=/my-reservations";
      }
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <header className="mb-12 border-b border-[var(--surface-border)] pb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest">My Reservations</h1>
            <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.3em]">Your journey with The Divine</p>
          </header>

          {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-primary)]"></div>
             </div>
          ) : reservations.length === 0 ? (
             <div className="text-center py-20 bg-[var(--surface-dark)] border border-[var(--surface-border)]">
                <p className="text-gray-500 uppercase tracking-widest text-xs">No reservations found yet.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reservations.map(res => (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     key={res.id} 
                     className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 relative group hover:border-[var(--gold-primary)]/50 transition-all"
                   >
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-10 h-10 bg-[var(--gold-primary)]/10 flex items-center justify-center text-[var(--gold-primary)]">
                            <Calendar size={20}/>
                         </div>
                         <span className={clsx(
                           "text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded border",
                           res.status === "confirmed" ? "border-green-500/20 text-green-500 bg-green-500/5" :
                           res.status === "cancelled" ? "border-red-500/20 text-red-500 bg-red-500/5" :
                           "border-yellow-500/20 text-yellow-500 bg-yellow-500/5"
                         )}>
                           {res.status}
                         </span>
                      </div>

                      <div className="space-y-4">
                         <div>
                            <p className="text-white text-lg font-serif">{res.date}</p>
                            <p className="text-[var(--gold-primary)] text-[10px] uppercase tracking-widest font-bold mt-1">{res.time}</p>
                         </div>
                         <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest">
                            <MapPin size={12}/> Table {res.tableId} • {res.guests} Guests
                         </div>
                      </div>

                      <button 
                        onClick={() => setSelectedRes(res)}
                        className="mt-8 w-full py-3 border border-[var(--surface-border)] text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white hover:border-white transition-all flex items-center justify-center gap-2"
                      >
                         <Receipt size={14}/> View Receipt
                      </button>
                   </motion.div>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedRes && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setSelectedRes(null)} 
               className="absolute inset-0 bg-black/90 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }} 
               className="relative w-full max-w-md"
             >
                <button 
                  onClick={() => setSelectedRes(null)}
                  className="absolute -top-12 right-0 text-white hover:text-[var(--gold-primary)] transition-colors print:hidden"
                >
                   <X size={24}/>
                </button>

                {/* The Actual Receipt */}
                <div id="reservation-receipt" className="bg-black border border-[var(--gold-primary)]/30 p-8 relative overflow-hidden text-left shadow-2xl">
                   <div className="absolute top-0 right-0 p-2 opacity-10 print:hidden">
                      <MapPin size={100} className="text-[var(--gold-primary)]"/>
                   </div>
                   <div className="border-b border-[var(--surface-border)] pb-4 mb-4 flex justify-between items-end">
                      <div>
                         <p className="text-[var(--gold-primary)] text-[8px] uppercase tracking-widest font-bold">Reservation ID</p>
                         <p className="text-white text-xs font-mono">{selectedRes.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[var(--gold-primary)] text-[8px] uppercase tracking-widest font-bold">Status</p>
                         <p className="text-green-500 text-[10px] font-bold uppercase">{selectedRes.status}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-gray-500 text-[8px] uppercase tracking-widest">Guest Name</p>
                            <p className="text-white text-sm font-bold uppercase tracking-widest">{selectedRes.name}</p>
                         </div>
                         <div>
                            <p className="text-gray-500 text-[8px] uppercase tracking-widest">Table Number</p>
                            <p className="text-[var(--gold-primary)] text-sm font-bold uppercase tracking-widest">Table {selectedRes.tableId}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-gray-500 text-[8px] uppercase tracking-widest">Date & Time</p>
                            <p className="text-white text-xs">{selectedRes.date} • {selectedRes.time}</p>
                         </div>
                         <div>
                            <p className="text-gray-500 text-[8px] uppercase tracking-widest">Party Size</p>
                            <p className="text-white text-xs">{selectedRes.guests} Guests</p>
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 pt-4 border-t border-dashed border-[var(--surface-border)] flex justify-between items-center">
                      <div className="w-12 h-12 bg-white/10 flex items-center justify-center p-1">
                         <div className="w-full h-full bg-black flex flex-wrap gap-0.5">
                            {[...Array(16)].map((_, i) => (
                               <div key={i} className={clsx("w-[22%] h-[22%]", Math.random() > 0.5 ? "bg-white" : "bg-transparent")}/>
                            ))}
                         </div>
                      </div>
                      <p className="text-[8px] text-gray-600 max-w-[120px] leading-tight uppercase italic">
                         Presented for table verification at The Divine Entrance.
                      </p>
                   </div>
                   
                   <div className="mt-8 print:hidden">
                      <button 
                        onClick={() => window.print()}
                        className="w-full py-4 bg-[var(--gold-primary)] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                      >
                         Print Receipt
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
