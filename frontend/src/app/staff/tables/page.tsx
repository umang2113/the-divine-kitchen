"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";

interface Order {
  id: string;
  orderType: string;
  tableNumber: string;
  status: string;
  createdAt: string;
  totalAmount: number;
}

export default function TableManagement() {
  const [activeTables, setActiveTables] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // We assume there are 20 tables in the restaurant
  const ALL_TABLES = Array.from({ length: 20 }, (_, i) => `T${i + 1}`);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Filter for active dine-in orders
      const activeDineIn = data.filter((o: Order) => 
        o.orderType === "dine_in" && 
        o.status !== "completed" && 
        o.status !== "delivered" &&
        o.tableNumber
      );
      
      setActiveTables(activeDineIn);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading Tables...</div>;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-6">
      <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Table Management</h2>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black/50 border border-[var(--surface-border)] rounded"></div>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--gold-primary)] rounded"></div>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Occupied</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {ALL_TABLES.map(tableName => {
          const activeOrder = activeTables.find(o => o.tableNumber === tableName);
          const isOccupied = !!activeOrder;

          return (
            <motion.div
              key={tableName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border flex flex-col items-center justify-center min-h-[120px] transition-all
                ${isOccupied 
                  ? 'bg-[var(--gold-primary)] border-[var(--gold-dark)] text-black shadow-lg shadow-gold/20' 
                  : 'bg-black/50 border-[var(--surface-border)] text-gray-400 hover:border-white/20'
                }`}
            >
              <h3 className="text-2xl font-serif font-bold mb-2">{tableName}</h3>
              {isOccupied ? (
                <>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1">
                    <Clock size={12} />
                    {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs font-bold bg-black/10 px-2 py-1 rounded">
                    ₹{activeOrder.totalAmount}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-50">
                  <Users size={12} />
                  Available
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
