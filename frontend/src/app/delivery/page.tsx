"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  MapPin, 
  Package, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  User,
  Power,
  ChevronRight,
  PhoneCall,
  QrCode,
  X,
  LogOut,
  Settings
} from "lucide-react";
import { 
  getAvailableOrders, 
  getMyDeliveryOrders, 
  getDeliveryStats,
  updateLocation,
  generateDeliveryPaymentLink,
  getOrderStatus
} from "@/lib/api";
import clsx from "clsx";

export default function DeliveryDashboard() {
  const [activeTab, setActiveTab] = useState<"available" | "active" | "stats" | "profile">("active");
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showQR, setShowQR] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [otpOrderId, setOtpOrderId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "generating" | "processing" | "success">("idle");
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "available") {
        const data = await getAvailableOrders();
        setAvailableOrders(data);
      } else if (activeTab === "active") {
        const data = await getMyDeliveryOrders();
        setMyOrders(data);
      } else if (activeTab === "stats") {
        const data = await getDeliveryStats();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching delivery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateDeliveryStatus(orderId, status);
      alert(`Order status updated to ${status.replace('_', ' ')}`);
      fetchData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const initiateOtpDelivery = (orderId: string) => {
    setOtpOrderId(orderId);
    setOtpValue("");
    setOtpError("");
  };

  const handleVerifyOtpAndDeliver = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      if (otpOrderId) {
        await updateDeliveryStatus(otpOrderId, "delivered", otpValue);
        alert("OTP Verified! Order marked as Delivered successfully.");
        setOtpOrderId(null);
        fetchData();
      }
    } catch (error: any) {
      setOtpError(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleShowQR = async (order: any) => {
    setShowQR(order);
    setPaymentStatus("generating");
    try {
      const data = await generateDeliveryPaymentLink({ amount: order.totalAmount, orderId: order.id });
      if (data.success && data.short_url) {
        setQrUrl(data.short_url);
        setPaymentStatus("processing");
      } else {
        alert("Failed to generate payment link.");
        setShowQR(null);
        setPaymentStatus("idle");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating QR");
      setShowQR(null);
      setPaymentStatus("idle");
    }
  };

  useEffect(() => {
    let pollInterval: any;
    if (showQR && paymentStatus === "processing") {
      pollInterval = setInterval(async () => {
        try {
          const orderData = await getOrderStatus(showQR.id);
          if (orderData?.paymentStatus === 'paid') {
            setPaymentStatus("success");
            clearInterval(pollInterval);
            setTimeout(() => {
              setShowQR(null);
              setPaymentStatus("idle");
              setQrUrl("");
              fetchData();
            }, 3000);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [showQR, paymentStatus]);

  // Simulate Live Location Tracking
  useEffect(() => {
    let interval: any;
    if (isOnline && myOrders.length > 0) {
      interval = setInterval(() => {
        // Simulate minor location shifts
        const lat = 28.6139 + (Math.random() - 0.5) * 0.01;
        const lng = 77.2090 + (Math.random() - 0.5) * 0.01;
        
        // Update first active order's location
        const activeOrder = myOrders.find(o => o.status === 'out_for_delivery');
        if (activeOrder) {
          updateLocation({ lat, lng, orderId: activeOrder.id });
        }
      }, 5000); // Update every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isOnline, myOrders]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="p-6 bg-[var(--surface-dark)] border-b border-[var(--surface-border)] flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--gold-primary)] rounded-full flex items-center justify-center text-black">
            <User size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest">The Divine</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Delivery Partner</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
            isOnline ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )}
        >
          <Power size={12} /> {isOnline ? "Online" : "Offline"}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto pb-32">
        
        {/* Navigation Tabs */}
        <div className="flex bg-[var(--surface-dark)] rounded-xl p-1 mb-8 border border-[var(--surface-border)] overflow-x-auto">
          {(["available", "active", "stats", "profile"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "flex-1 min-w-[80px] py-3 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all",
                activeTab === tab ? "bg-[var(--gold-primary)] text-black" : "text-gray-500 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "available" && (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-serif mb-6">Available Pickups</h2>
              {availableOrders.length === 0 ? (
                <div className="text-center py-20 bg-[var(--surface-dark)] rounded-xl border border-dashed border-[var(--surface-border)]">
                   <Package size={40} className="text-gray-700 mx-auto mb-4" />
                   <p className="text-gray-500 text-xs uppercase tracking-widest">No orders waiting for pickup</p>
                </div>
              ) : (
                availableOrders.map((order) => (
                  <div key={order.id} className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 rounded-xl space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[var(--gold-primary)] text-[10px] font-bold uppercase mb-1">Order #{order.id.substring(0, 6)}</p>
                           <h3 className="text-white font-bold">{order.items.length} Items • ₹{order.totalAmount}</h3>
                        </div>
                        <span className="bg-blue-500/10 text-blue-500 text-[9px] px-2 py-1 rounded uppercase font-bold">Ready for Pickup</span>
                     </div>
                     <div className="flex items-start gap-3 text-xs text-gray-400">
                        <MapPin size={16} className="text-[var(--gold-primary)] shrink-0" />
                        <p>{order.shippingDetails?.address}</p>
                     </div>
                     <button 
                       onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                       className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-[var(--gold-primary)] transition-all"
                     >
                       Accept Pickup
                     </button>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-serif mb-6">In Progress</h2>
              {myOrders.length === 0 ? (
                <div className="text-center py-20 bg-[var(--surface-dark)] rounded-xl border border-dashed border-[var(--surface-border)]">
                   <Navigation size={40} className="text-gray-700 mx-auto mb-4" />
                   <p className="text-gray-500 text-xs uppercase tracking-widest">You have no active deliveries</p>
                </div>
              ) : (
                myOrders.map((order) => (
                  <div key={order.id} className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-xl overflow-hidden">
                     {/* Map Placeholder */}
                     <div className="h-40 bg-gray-900 relative">
                        <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2/static/-122.41,37.77,12/400x200.png?key=get_your_own_key')] bg-cover opacity-30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-8 h-8 bg-[var(--gold-primary)] rounded-full animate-ping opacity-20" />
                           <Navigation className="text-[var(--gold-primary)] relative z-10" size={24} />
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded text-[9px] uppercase tracking-widest border border-white/10">
                           {Math.floor(Math.random() * 5) + 2} mins away
                        </div>
                     </div>

                     <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Customer</p>
                              <h3 className="text-white font-bold">{order.shippingDetails?.name}</h3>
                           </div>
                           <a 
                             href={`tel:${order.shippingDetails?.phone}`}
                             className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                           >
                              <PhoneCall size={18} />
                           </a>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg space-y-3">
                           <div className="flex items-start gap-3 text-xs">
                              <MapPin size={16} className="text-[var(--gold-primary)] mt-0.5" />
                              <p className="text-white">{order.shippingDetails?.address}</p>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-gray-500">
                              <Package size={16} />
                              <p>{order.items.length} items to deliver</p>
                           </div>
                        </div>

                        {/* Payment Method / Prepaid Details */}
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-[var(--surface-border)]">
                           <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Payment Mode</span>
                           {order.paymentStatus === 'paid' ? (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1 rounded border border-green-500/20 animate-pulse">
                                 Payment Prepaid
                              </span>
                           ) : (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded border border-yellow-500/20">
                                 Cash on Delivery (₹{order.totalAmount})
                              </span>
                           )}
                        </div>

                        <div className="flex flex-col gap-3">
                           {order.status === 'picked_up' && (
                             <button 
                               onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                               className="w-full py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-[10px] rounded-lg"
                             >
                               Start Delivery
                             </button>
                           )}
                           {order.status === 'out_for_delivery' && (
                             <>
                               {order.paymentStatus === 'paid' ? (
                                 <button 
                                   onClick={() => initiateOtpDelivery(order.id)}
                                   className="w-full py-4 bg-green-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg shadow-lg shadow-green-500/20"
                                 >
                                   Verify OTP & Deliver
                                 </button>
                               ) : (
                                 <>
                                   <button 
                                     onClick={() => handleShowQR(order)}
                                     className="w-full py-4 bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all"
                                   >
                                     <QrCode size={16} /> Pay by User
                                   </button>
                                   <button 
                                     onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                     className="w-full py-4 bg-green-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg shadow-lg shadow-green-500/20"
                                   >
                                     Mark as Delivered
                                   </button>
                                 </>
                               )}
                             </>
                           )}
                        </div>
                     </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-serif mb-6">Performance</h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[var(--surface-dark)] p-6 rounded-xl border border-[var(--surface-border)]">
                    <TrendingUp size={24} className="text-green-500 mb-4" />
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Today's Earnings</p>
                    <h3 className="text-2xl font-serif text-white">₹{stats?.earnings || 0}</h3>
                 </div>
                 <div className="bg-[var(--surface-dark)] p-6 rounded-xl border border-[var(--surface-border)]">
                    <CheckCircle size={24} className="text-[var(--gold-primary)] mb-4" />
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Delivered</p>
                    <h3 className="text-2xl font-serif text-white">{stats?.deliveredCount || 0}</h3>
                 </div>
              </div>

              <div className="bg-[var(--surface-dark)] p-6 rounded-xl border border-[var(--surface-border)] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                       <Clock size={24} />
                    </div>
                    <div>
                       <p className="text-white font-bold">Duty Hours</p>
                       <p className="text-gray-500 text-xs">Today: 6h 24m</p>
                    </div>
                 </div>
                 <ChevronRight className="text-gray-600" />
              </div>
            </motion.div>
          )}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 text-center rounded-xl">
                 <div className="w-20 h-20 bg-black border border-[var(--gold-primary)] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User size={32} className="text-[var(--gold-primary)]" />
                 </div>
                 <h3 className="text-white font-serif text-xl uppercase tracking-widest">Delivery Partner</h3>
                 <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">ID: #DEV-{Math.floor(Math.random()*10000)}</p>
              </div>

              <div className="space-y-4">
                 <button className="w-full p-6 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-xl flex items-center justify-between group hover:border-[var(--gold-primary)]/50 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[var(--gold-primary)] transition-colors">
                          <Settings size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-white text-sm font-bold">Settings</p>
                          <p className="text-gray-500 text-[10px]">App preferences & notifications</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600" />
                 </button>

                 <button 
                   onClick={handleLogout}
                   className="w-full p-6 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between group hover:bg-red-500 transition-all"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 group-hover:text-white transition-colors">
                          <LogOut size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-red-500 group-hover:text-white text-sm font-bold uppercase tracking-widest">Sign Out</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-red-500 group-hover:text-white" />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Footer Tab Bar */}
      <nav className="fixed bottom-0 w-full bg-[var(--surface-dark)] border-t border-[var(--surface-border)] p-4 flex justify-around items-center z-50 lg:hidden">
         <button 
           onClick={() => setActiveTab("active")}
           className={clsx("flex flex-col items-center gap-1", activeTab === "active" ? "text-[var(--gold-primary)]" : "text-gray-500")}
         >
            <Navigation size={20} />
            <span className="text-[8px] uppercase font-bold">Go</span>
         </button>
         <button 
           onClick={() => setActiveTab("available")}
           className={clsx("flex flex-col items-center gap-1", activeTab === "available" ? "text-[var(--gold-primary)]" : "text-gray-500")}
         >
            <Package size={20} />
            <span className="text-[8px] uppercase font-bold">Orders</span>
         </button>
         <button 
           onClick={() => setActiveTab("profile")}
           className={clsx("flex flex-col items-center gap-1", activeTab === "profile" ? "text-[var(--gold-primary)]" : "text-gray-500")}
         >
            <User size={20} />
            <span className="text-[8px] uppercase font-bold">Account</span>
         </button>
      </nav>

      {/* QR Payment Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[var(--surface-dark)] border border-[var(--gold-primary)]/30 p-8 rounded-2xl w-full max-w-sm relative overflow-hidden"
            >
               <button 
                 onClick={() => {
                   setShowQR(null);
                   setPaymentStatus("idle");
                   setQrUrl("");
                 }}
                 className="absolute top-4 right-4 text-gray-500 hover:text-white"
               >
                 <X size={24} />
               </button>

               <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-[var(--gold-primary)] tracking-[0.2em] uppercase text-[10px] font-bold mb-2">Payment Request</h3>
                    <p className="text-3xl font-serif text-white italic">₹{showQR.totalAmount}</p>
                  </div>

                  {/* QR Code Simulation */}
                  <div className="bg-white p-4 rounded-xl inline-block relative group">
                     <div className="w-48 h-48 bg-white flex items-center justify-center overflow-hidden relative">
                        {paymentStatus === "success" && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 z-20 bg-green-500/90 flex flex-col items-center justify-center backdrop-blur-sm"
                          >
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1.2 }}
                              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                              className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-xl"
                            >
                              <CheckCircle size={40} className="text-green-500" />
                            </motion.div>
                            <span className="text-white font-bold tracking-widest text-[10px] uppercase">Payment Received</span>
                          </motion.div>
                        )}

                        {paymentStatus === "generating" ? (
                          <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                             <div className="w-6 h-6 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin" />
                             <span className="text-[8px] uppercase tracking-widest">Generating Secure QR...</span>
                          </div>
                        ) : (
                          qrUrl && (
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} 
                              alt="Payment QR" 
                              className={clsx("w-full h-full transition-all duration-500", paymentStatus === "success" && "blur-sm scale-95 opacity-50")}
                            />
                          )
                        )}
                     </div>
                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <QrCode size={40} className="text-[var(--gold-primary)] mb-2" />
                        <p className="text-[8px] uppercase tracking-widest text-white">Scan with UPI</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-gray-400 text-[10px] uppercase tracking-widest leading-relaxed">
                        User can scan this QR code using any UPI app (Google Pay, PhonePe, etc.) to pay the restaurant.
                     </p>
                     
                     <div className="h-[1px] bg-[var(--surface-border)] w-full" />

                     {paymentStatus === "processing" && (
                        <div className="py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center gap-2">
                           <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                           <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest">Awaiting Payment...</span>
                        </div>
                     )}
                     
                     {paymentStatus === "success" && (
                        <div className="py-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center gap-2">
                           <CheckCircle size={16} className="text-green-500" />
                           <span className="text-green-500 text-[10px] uppercase font-bold tracking-widest">Transaction Successful</span>
                        </div>
                     )}
                  </div>

                  <p className="text-[9px] text-gray-600 uppercase tracking-tighter">
                    Payment will be directly credited to The Divine Kitchen account.
                  </p>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {otpOrderId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[var(--surface-dark)] border border-[var(--gold-primary)]/30 p-8 rounded-2xl w-full max-w-sm relative overflow-hidden"
            >
               <button 
                 onClick={() => setOtpOrderId(null)}
                 className="absolute top-4 right-4 text-gray-500 hover:text-white"
               >
                 <X size={24} />
               </button>

               <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-[var(--gold-primary)] tracking-[0.2em] uppercase text-[10px] font-bold mb-2">Prepaid Delivery</h3>
                    <p className="text-xl font-serif text-white uppercase tracking-widest">Verify OTP</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Please collect the 6-digit OTP from the customer's email to verify and complete the delivery.
                    </p>
                  </div>

                  <div className="space-y-4">
                     <input 
                       type="text" 
                       maxLength={6}
                       placeholder="Enter 6-Digit OTP" 
                       value={otpValue}
                       onChange={(e) => {
                         const val = e.target.value.replace(/\D/g, "");
                         setOtpValue(val);
                       }}
                       className="w-full bg-background border border-[var(--surface-border)] p-4 text-center text-white tracking-[0.5em] text-xl font-mono focus:border-[var(--gold-primary)] outline-none rounded-lg" 
                     />

                     {otpError && (
                       <p className="text-red-500 text-xs font-semibold">{otpError}</p>
                     )}

                     <button 
                       onClick={handleVerifyOtpAndDeliver}
                       disabled={otpLoading || otpValue.length !== 6}
                       className="w-full py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-white transition-all disabled:opacity-50"
                     >
                       {otpLoading ? "Verifying..." : "Verify & Deliver"}
                     </button>
                  </div>

                  <p className="text-[9px] text-gray-600 uppercase tracking-tighter">
                    Prepaid order verification protects both customers and valets.
                  </p>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
