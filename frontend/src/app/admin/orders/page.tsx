"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/api";
import clsx from "clsx";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    fetchOrders();
  };

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[var(--surface-border)]">
              <th className="pb-4 font-bold">Order ID</th>
              <th className="pb-4 font-bold">Customer</th>
              <th className="pb-4 font-bold">Items</th>
              <th className="pb-4 font-bold">Total</th>
              <th className="pb-4 font-bold">Delivery Boy</th>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-[var(--surface-border)]/50 last:border-0 hover:bg-white/5 transition-colors">
                <td className="py-6 text-[var(--gold-primary)] text-xs font-bold font-mono">#{order.id.slice(-8)}</td>
                <td className="py-6">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">{order.shippingDetails?.name}</p>
                  <p className="text-gray-500 text-[10px]">{order.shippingDetails?.phone}</p>
                </td>
                <td className="py-6">
                  <p className="text-gray-400 text-[10px]">{order.items?.length || 0} items</p>
                </td>
                <td className="py-6 text-white font-serif">₹{order.totalAmount}</td>
                <td className="py-6">
                   {order.deliveryBoyId ? (
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] text-[var(--gold-primary)]">DB</div>
                         <div>
                            <p className="text-white text-[10px] font-bold uppercase">Partner Assigned</p>
                            {(order.status === 'picked_up' || order.status === 'out_for_delivery') && (
                               <span className="text-green-500 text-[8px] animate-pulse font-bold uppercase tracking-tighter">● Live Tracking</span>
                            )}
                         </div>
                      </div>
                   ) : (
                      <p className="text-gray-600 text-[9px] uppercase tracking-widest font-bold">Waiting for Pickup</p>
                   )}
                </td>
                <td className="py-6">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                    order.status === "delivered" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                    order.status === "cancelled" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleStatusUpdate(order.id, "delivered")} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={14}/></button>
                    <button onClick={() => handleStatusUpdate(order.id, "cancelled")} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><XCircle size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
