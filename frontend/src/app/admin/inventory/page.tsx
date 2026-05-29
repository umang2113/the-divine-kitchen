"use client";

import { useState, useEffect } from "react";
import { Package, Search, Plus, Minus, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  stockQuantity: number;
  isAvailable: boolean;
  category_name: string;
}

export default function InventoryManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/menu`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, newQuantity: number) => {
    const updatedQty = Math.max(0, newQuantity);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/menu/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stockQuantity: updatedQty })
      });
      
      setItems(items.map(item => 
        item.id === id 
          ? { ...item, stockQuantity: updatedQty, isAvailable: updatedQty > 0 } 
          : item
      ));
    } catch (error) {
      alert("Failed to update stock");
    }
  };

  const filteredItems = items.filter(i => 
    i.name?.toLowerCase().includes(search.toLowerCase()) || 
    i.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-white">Loading Inventory...</div>;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 min-h-[80vh] rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-xl font-serif text-white uppercase tracking-widest flex items-center gap-2">
          <Package size={24} className="text-[var(--gold-primary)]" /> Menu Inventory
        </h2>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search items or categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-[var(--surface-border)] rounded pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map(item => (
          <motion.div 
            key={item.id}
            layout
            className={`flex flex-col md:flex-row justify-between items-center p-4 border rounded ${
              item.stockQuantity <= 5 ? 'bg-red-900/10 border-red-500/30' : 'bg-black/20 border-[var(--surface-border)]/50'
            }`}
          >
            <div className="flex-1 mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold">{item.name}</p>
                {item.stockQuantity <= 5 && (
                  <span className="text-red-400 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest">
                    <AlertTriangle size={12} /> Low Stock
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{item.category_name}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-black border border-[var(--surface-border)] rounded-full p-1">
                <button 
                  onClick={() => updateStock(item.id, (item.stockQuantity || 0) - 1)}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-900/50 flex items-center justify-center text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                
                <div className="w-12 text-center font-mono font-bold text-lg">
                  {item.stockQuantity ?? 999}
                </div>
                
                <button 
                  onClick={() => updateStock(item.id, (item.stockQuantity || 0) + 1)}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-green-900/50 flex items-center justify-center text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="w-24 text-right">
                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${item.isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-gray-500 uppercase tracking-widest text-sm text-center py-10">No items found</p>
        )}
      </div>
    </div>
  );
}
