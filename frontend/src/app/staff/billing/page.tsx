"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, DollarSign, Wallet, CreditCard, Clock } from "lucide-react";

export default function ShiftBilling() {
  const [summary, setSummary] = useState({ cash: 0, online: 0, card: 0, total: 0, activeOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders/shift-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading Billing Info...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Shift Report</h2>
          <p className="text-gray-400 text-sm mt-1">{currentDate}</p>
        </div>
        <button onClick={fetchSummary} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[var(--gold-primary)] hover:text-white transition-colors">
          <Clock size={16} /> Refresh
        </button>
      </div>

      <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-8">
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-8 mb-8">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Total Shift Revenue</p>
            <h3 className="text-5xl font-serif text-[var(--gold-primary)]">₹{summary.total}</h3>
          </div>
          <div className="w-16 h-16 bg-[var(--gold-primary)]/10 rounded-full flex items-center justify-center border border-[var(--gold-dark)]">
            <Receipt size={32} className="text-[var(--gold-primary)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/50 p-6 rounded-lg border border-[var(--surface-border)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded text-green-500"><Wallet size={20} /></div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Cash</p>
            </div>
            <p className="text-2xl font-serif text-white">₹{summary.cash}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/50 p-6 rounded-lg border border-[var(--surface-border)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded text-purple-500"><DollarSign size={20} /></div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">UPI / Online</p>
            </div>
            <p className="text-2xl font-serif text-white">₹{summary.online}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/50 p-6 rounded-lg border border-[var(--surface-border)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded text-orange-500"><CreditCard size={20} /></div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Card</p>
            </div>
            <p className="text-2xl font-serif text-white">₹{summary.card}</p>
          </motion.div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-[var(--surface-border)]">
           <button onClick={() => window.print()} className="w-full bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest py-4 rounded hover:bg-white transition-colors">
             Print Z-Report
           </button>
        </div>
      </div>
    </div>
  );
}
