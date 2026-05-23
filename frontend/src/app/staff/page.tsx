"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, Wallet, ChefHat } from "lucide-react";

export default function StaffDashboard() {
  const [summary, setSummary] = useState({ cash: 0, online: 0, card: 0, total: 0, activeOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error("Failed to fetch shift summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const stats = [
    { title: "Active Orders", value: summary.activeOrders, icon: ChefHat, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Cash Collected", value: `₹${summary.cash}`, icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Online/UPI", value: `₹${summary.online}`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Card Payments", value: `₹${summary.card}`, icon: CreditCard, color: "text-orange-500", bg: "bg-orange-500/10" }
  ];

  if (loading) return <div className="text-white">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 rounded-lg flex items-center gap-4"
            >
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">{stat.title}</p>
                <p className="text-2xl font-serif text-white">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 rounded-lg">
         <h3 className="text-lg font-serif text-white uppercase tracking-widest mb-4">Quick Actions</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/staff/pos" className="bg-[var(--gold-primary)] text-black py-4 px-4 rounded-md text-center font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
              New POS Order
            </a>
            <a href="/staff/orders" className="bg-white/5 text-white border border-white/10 py-4 px-4 rounded-md text-center font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
              Manage Orders
            </a>
         </div>
      </div>
    </div>
  );
}
