"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getMyOrders, getOrderDetails } from "@/lib/api";
import { ShoppingBag, ChevronDown, ChevronUp, Clock, Package, MapPin, Navigation, Star } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import ReviewModal from "@/components/ReviewModal";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<{id: string, name: string} | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        clearCart();
        alert("Payment Successful! Your order is being prepared.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [clearCart]);

  useEffect(() => {
    fetchOrders();

    // Start polling if there's an active order
    const interval = setInterval(() => {
      refreshActiveOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [expandedOrder]);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveOrders = async () => {
    const activeOrders = orders.filter(o => o.status === 'picked_up' || o.status === 'out_for_delivery');
    if (activeOrders.length === 0) return;

    try {
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          if (order.status === 'picked_up' || order.status === 'out_for_delivery') {
            const freshData = await getOrderDetails(order.id);
            return freshData ? { ...order, ...freshData } : order;
          }
          return order;
        })
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Polling Error:", error);
    }
  };

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Helper to get valet position on the mockup map
  const getValetPosition = (order: any) => {
    if (order.deliveryLocation) {
      // Logic to map lat/lng to CSS percentages if real coordinates existed
      // For demonstration, we use the updated coordinates to create a predictable movement
      return {
        x: `${(order.deliveryLocation.lng % 0.1) * 1000}%`,
        y: `${(order.deliveryLocation.lat % 0.1) * 1000}%`
      };
    }
    return { x: '50%', y: '50%' };
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-primary)]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 md:px-12 container mx-auto max-w-4xl">
        <header className="mb-12 text-center">
           <motion.span 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-[var(--gold-primary)] text-xs font-bold uppercase tracking-[0.4em] mb-4 block"
           >
             Culinary Journey
           </motion.span>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest"
           >
             Order <span className="text-gradient-gold italic">History</span>
           </motion.h1>
        </header>

        <div className="space-y-6">
           {orders.length === 0 ? (
             <div className="text-center py-20 bg-[var(--surface-dark)] border border-[var(--surface-border)]">
                <ShoppingBag size={48} className="text-gray-700 mx-auto mb-6" />
                <h3 className="text-white font-serif text-xl mb-2">No Orders Found</h3>
                <p className="text-gray-500 text-sm mb-8">You haven't placed any culinary orders yet.</p>
                <button 
                  onClick={() => window.location.href = '/menu'}
                  className="px-8 py-3 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all"
                >
                  Explore Our Menu
                </button>
             </div>
           ) : (
             orders.map((order, index) => (
               <motion.div 
                 key={order.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-sm overflow-hidden"
               >
                 {/* Order Header */}
                 <div 
                   onClick={() => toggleOrder(order.id)}
                   className="p-6 md:p-8 cursor-pointer hover:bg-white/5 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-black flex items-center justify-center border border-[var(--surface-border)]">
                          <Package className="text-[var(--gold-primary)]" size={20} />
                       </div>
                       <div>
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Order ID</p>
                          <p className="text-white text-xs font-mono uppercase">#{order.id.substring(0, 8)}</p>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-8 md:gap-12">
                       <div>
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Placed On</p>
                          <p className="text-white text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Amount</p>
                          <p className="text-[var(--gold-primary)] text-xs font-bold">₹{order.totalAmount}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Status</p>
                          <span className={clsx(
                             "text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border",
                             order.status === 'delivered' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          )}>
                             {order.status}
                          </span>
                       </div>
                    </div>

                    <div className="ml-auto">
                       {expandedOrder === order.id ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                    </div>
                 </div>

                 {/* Order Details (Expanded) */}
                 <AnimatePresence>
                    {expandedOrder === order.id && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="border-t border-[var(--surface-border)] bg-black/30"
                       >
                          <div className="p-8 space-y-6">
                             <div className="space-y-4">
                                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold border-b border-[var(--surface-border)] pb-2">Items Ordered</p>
                                {order.items.map((item: any, i: number) => (
                                   <div key={i} className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                                      <div className="flex items-center gap-4">
                                         <span className="text-[var(--gold-primary)] font-mono text-xs">{item.quantity}x</span>
                                         <span className="text-white uppercase tracking-wider text-xs">{item.name}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                         <span className="text-gray-400 font-mono text-xs">₹{item.price * item.quantity}</span>
                                         {order.status === 'delivered' && (
                                           <button 
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               setSelectedItemForReview({ id: item.id, name: item.name });
                                               setReviewModalOpen(true);
                                             }}
                                             className="flex items-center gap-1 text-[8px] uppercase tracking-widest text-[var(--gold-primary)] hover:text-white border border-[var(--gold-primary)]/50 px-2 py-1 rounded transition-colors"
                                           >
                                             <Star size={10} /> Rate
                                           </button>
                                         )}
                                      </div>
                                   </div>
                                ))}
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--surface-border)]">
                                <div>
                                   <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Delivery Address</p>
                                   <p className="text-white text-xs leading-relaxed font-light">
                                      {order.shippingDetails?.address}, {order.shippingDetails?.city} {order.shippingDetails?.zipCode}
                                   </p>
                                </div>
                                 <div className="text-right flex flex-col justify-end">
                                    <div className="flex justify-between md:justify-end md:gap-12 text-xs uppercase tracking-widest">
                                       <span className="text-gray-500">Subtotal</span>
                                       <span className="text-white">₹{order.totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end md:gap-12 text-xs uppercase tracking-widest mt-2">
                                       <span className="text-gray-500">Delivery</span>
                                       <span className="text-green-500">FREE</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end md:gap-12 text-lg font-serif uppercase tracking-widest mt-4 pt-4 border-t border-[var(--surface-border)]">
                                       <span className="text-white">Total</span>
                                       <span className="text-[var(--gold-primary)]">₹{order.totalAmount}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Live Tracking Map Section */}
                              {(order.status === 'picked_up' || order.status === 'out_for_delivery') && (
                                <div className="mt-8 pt-8 border-t border-[var(--surface-border)]">
                                   <div className="flex items-center justify-between mb-4">
                                      <h4 className="text-white font-serif text-lg flex items-center gap-2">
                                         <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                         </span>
                                         Live Tracking
                                      </h4>
                                      <p className="text-[var(--gold-primary)] text-[10px] uppercase font-bold tracking-widest">
                                         {order.status === 'picked_up' ? "Order Picked Up" : "Out for Delivery"}
                                      </p>
                                   </div>
                                   <div className="h-64 bg-gray-900 rounded-sm overflow-hidden relative border border-[var(--surface-border)]">
                                      {/* New Abstract Map Placeholder */}
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover opacity-20 grayscale" />
                                      
                                      {/* Delivery Boy Marker */}
                                      <motion.div 
                                        animate={{ 
                                           left: order.deliveryLocation ? `${((order.deliveryLocation.lng % 0.01) * 10000)}%` : '40%',
                                           top: order.deliveryLocation ? `${((order.deliveryLocation.lat % 0.01) * 10000)}%` : '60%',
                                        }}
                                        transition={{ duration: 4, ease: "linear" }}
                                        className="absolute z-20"
                                      >
                                         <div className="relative -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-10 h-10 bg-[var(--gold-primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--gold-primary)]/20">
                                               <Navigation size={20} className="text-black rotate-45" />
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded border border-[var(--gold-primary)]/30 whitespace-nowrap">
                                               <p className="text-[8px] text-white font-bold uppercase tracking-widest">Valet is on the way</p>
                                            </div>
                                         </div>
                                      </motion.div>

                                      {/* Destination Marker */}
                                      <div className="absolute right-10 top-10 z-10">
                                         <MapPin size={32} className="text-red-500 drop-shadow-xl" />
                                      </div>
                                   </div>
                                </div>
                              )}
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
               </motion.div>
             ))
           )}
        </div>
      </div>

      <Footer />
      {selectedItemForReview && (
        <ReviewModal 
          isOpen={reviewModalOpen} 
          onClose={() => setReviewModalOpen(false)} 
          menuItemId={selectedItemForReview.id} 
          itemName={selectedItemForReview.name} 
        />
      )}
    </main>
  );
}
