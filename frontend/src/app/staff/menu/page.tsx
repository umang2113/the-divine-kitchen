"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToggleRight, ToggleLeft } from "lucide-react";

interface MenuItem {
  id: string;
  name?: string;
  catalogue_name?: string;
  current_price: number;
  isAvailable: boolean;
  category_name?: string;
}

export default function MenuAvailability() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/menu`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/menu/${id}/availability`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      
      if (res.ok) {
        setItems(items.map(item => item.id === id ? { ...item, isAvailable: !currentStatus } : item));
      }
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  if (loading) return <div className="text-white">Loading Menu...</div>;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-6">
      <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Menu Item Availability</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--surface-border)]">
              <th className="py-3 px-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Item Name</th>
              <th className="py-3 px-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Category</th>
              <th className="py-3 px-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Price</th>
              <th className="py-3 px-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Status</th>
              <th className="py-3 px-4 text-xs uppercase tracking-widest text-gray-400 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-[var(--surface-border)] hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4 text-white text-sm font-bold">{item.catalogue_name || item.name}</td>
                <td className="py-3 px-4 text-gray-400 text-sm">{item.category_name}</td>
                <td className="py-3 px-4 text-[var(--gold-primary)] text-sm font-serif">₹{item.current_price}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${item.isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={`flex items-center justify-end w-full gap-2 text-xs uppercase tracking-widest font-bold transition-colors ${item.isAvailable ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}
                  >
                    {item.isAvailable ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-red-500" />}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
