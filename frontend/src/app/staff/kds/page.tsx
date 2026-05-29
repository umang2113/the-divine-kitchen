"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, CheckCircle, Clock } from "lucide-react";
import { io } from "socket.io-client";

interface Order {
  id: string;
  orderType: string;
  tableNumber?: string;
  status: string;
  createdAt: string;
  items: any[];
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Socket.io integration
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000");

    socket.on('newOrder', (order: Order) => {
      // Play a sound for new order
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log("Audio play blocked by browser:", e));
      
      setOrders(prev => {
        // Prevent duplicates
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    socket.on('orderUpdated', ({ id, status }: { id: string, status: string }) => {
      if (status === 'completed' || status === 'ready' || status === 'delivered') {
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Filter for orders that kitchen needs to see
      const active = data.filter((o: Order) => o.status === "preparing" || o.status === "received" || o.status === "pending_payment");
      setOrders(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white p-8">Loading KDS...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 font-mono">
      {/* KDS Header */}
      <header className="flex justify-between items-center bg-[var(--surface-dark)] p-4 rounded-lg mb-6 border border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--gold-primary)] rounded flex items-center justify-center text-black">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-[var(--gold-primary)]">Kitchen Display</h1>
            <p className="text-gray-400 text-xs tracking-widest uppercase">The Divine Restaurant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{orders.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Tickets</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </header>

      {/* Tickets Grid */}
      <div className="flex overflow-x-auto gap-4 pb-8 snap-x">
        <AnimatePresence>
          {orders.map((order, index) => {
            const isLate = (new Date().getTime() - new Date(order.createdAt).getTime()) > 15 * 60 * 1000; // 15 mins
            
            return (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`min-w-[320px] max-w-[320px] flex-shrink-0 bg-[var(--surface-dark)] border-2 ${isLate ? 'border-red-500' : 'border-[var(--surface-border)]'} rounded-lg flex flex-col snap-start overflow-hidden`}
              >
                {/* Ticket Header */}
                <div className={`p-3 border-b-2 flex justify-between items-center ${
                  order.orderType === 'dine_in' ? 'bg-blue-900/40 border-blue-500/50 text-blue-200' :
                  order.orderType === 'takeaway' ? 'bg-orange-900/40 border-orange-500/50 text-orange-200' :
                  'bg-purple-900/40 border-purple-500/50 text-purple-200'
                }`}>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {order.tableNumber ? `T-${order.tableNumber}` : `#${order.id.slice(-4)}`}
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {order.orderType?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className={`text-right flex flex-col items-end ${isLate ? 'text-red-400 animate-pulse' : ''}`}>
                    <Clock size={20} className="mb-1" />
                    <span className="text-xs font-bold">
                      {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)}m
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 flex-1 overflow-y-auto">
                  <ul className="space-y-4">
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx} className="flex gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                        <div className="w-8 h-8 shrink-0 bg-gray-800 text-white rounded flex items-center justify-center font-bold text-lg">
                          {item.quantity}
                        </div>
                        <div>
                          <p className="text-lg font-bold leading-tight">{item.name || 'Item'}</p>
                          {item.notes && <p className="text-sm text-red-400 mt-1 italic">Note: {item.notes}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="p-3 border-t border-[var(--surface-border)] mt-auto">
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/50"
                  >
                    <CheckCircle size={24} /> Food Ready
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {orders.length === 0 && (
          <div className="w-full py-32 flex flex-col items-center justify-center text-gray-600">
            <ChefHat size={64} className="mb-4 opacity-50" />
            <p className="text-2xl font-bold uppercase tracking-widest">No Active Tickets</p>
            <p className="text-sm">Kitchen is clear.</p>
          </div>
        )}
      </div>
    </div>
  );
}
