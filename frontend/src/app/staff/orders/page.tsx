"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { Printer } from "lucide-react";
import ThermalReceipt from "@/components/ThermalReceipt";

interface Order {
  id: string;
  orderType: string;
  tableNumber?: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: any[];
  shippingDetails?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    phone?: string;
  };
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();

    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000");

    socket.on('newOrder', (order: Order) => {
      // Play a sound for new order
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log("Audio play blocked:", e));
      
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    socket.on('orderUpdated', ({ id, status }: { id: string, status: string }) => {
      if (status === 'completed' || status === 'delivered') {
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
                {order.orderType === 'delivery' && order.shippingDetails?.latitude && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${order.shippingDetails.latitude},${order.shippingDetails.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline mt-1 inline-block"
                  >
                    📍 View on Google Maps
                  </a>
                )}
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
                <button 
                  onClick={() => {
                    setPrintingOrder(order);
                    setTimeout(() => window.print(), 100);
                  }}
                  className="px-4 bg-gray-800 text-white border border-gray-700 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-700"
                  title="Print Bill"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <p className="text-gray-500 uppercase tracking-widest text-sm py-10 col-span-full text-center">No active orders</p>
        )}
      </div>

      {/* Hidden Printable Receipt */}
      {printingOrder && (
        <ThermalReceipt 
          orderId={printingOrder.id}
          tableNumber={printingOrder.tableNumber}
          orderType={printingOrder.orderType}
          items={printingOrder.items}
          totalAmount={printingOrder.totalAmount}
          paymentMethod={(printingOrder as any).paymentMethod}
          customerName={(printingOrder.shippingDetails as any)?.name}
          customerPhone={(printingOrder.shippingDetails as any)?.phone}
          createdAt={printingOrder.createdAt}
        />
      )}
    </div>
  );
}
