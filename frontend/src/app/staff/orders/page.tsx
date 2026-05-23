"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  orderType: string;
  tableNumber?: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: any[];
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      // Filter out completed/delivered orders for the active orders view
      const active = data.filter((o: Order) => o.status !== "completed" && o.status !== "delivered");
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
        if (newStatus === "completed" || newStatus === "delivered") {
          setOrders(orders.filter(o => o.id !== id));
        } else {
          setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white">Loading Orders...</div>;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-6">
      <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Active Orders</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 border border-[var(--surface-border)] rounded-lg p-5 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4 border-b border-[var(--surface-border)] pb-4">
              <div>
                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${
                  order.orderType === 'dine_in' ? 'bg-blue-500/10 text-blue-500' :
                  order.orderType === 'takeaway' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-purple-500/10 text-purple-500'
                }`}>
                  {order.orderType?.replace('_', ' ')}
                </span>
                <h3 className="text-white font-bold mt-2">
                  {order.tableNumber ? `Table ${order.tableNumber}` : `Order #${order.id.slice(-6)}`}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[var(--gold-primary)] font-serif font-bold">₹{order.totalAmount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex-1 mb-4">
              <ul className="space-y-2 text-sm text-gray-300">
                {order.items?.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name || 'Item'}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-1">Update Status</p>
              <div className="flex gap-2">
                {order.status === 'received' || order.status === 'preparing' ? (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="flex-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-orange-500/20"
                  >
                    Mark Ready
                  </button>
                ) : null}
                
                <button 
                  onClick={() => updateStatus(order.id, 'completed')}
                  className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-green-500/20"
                >
                  Complete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <p className="text-gray-500 uppercase tracking-widest text-sm py-10 col-span-full text-center">No active orders</p>
        )}
      </div>
    </div>
  );
}
