"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";
import { placeOrder, initiatePaytmTransaction } from "@/lib/api";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Paytm">("COD");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      const msg = params.get("msg");
      if (paymentStatus === "failed") {
        alert(`Payment Failed: ${msg || "Transaction was cancelled."}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const loadPaytmScript = (mid: string, paytmHost: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://${paytmHost}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data && data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name,
            city: data.address.city || data.address.town || data.address.village || data.address.county || "",
            zipCode: data.address.postcode || ""
          }));
        } else {
          setFormData(prev => ({ ...prev, address: `Lat: ${latitude}, Lng: ${longitude}` }));
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setFormData(prev => ({ ...prev, address: `Lat: ${latitude}, Lng: ${longitude}` }));
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error("Location error:", error);
      alert("Unable to access location. Please check your browser permissions.");
      setIsLocating(false);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal,
        shippingDetails: formData,
        paymentMethod: paymentMethod === "COD" ? "Cash on Delivery" : "Paytm Online"
      };

      const result = await placeOrder(orderData);
      
      if (!result.id) {
        throw new Error("Failed to place order");
      }

      if (paymentMethod === "COD") {
        alert("Order Placed Successfully! We've sent a confirmation email.");
        clearCart();
        router.push("/my-orders");
      } else {
        // Paytm online payment flow
        const initData = await initiatePaytmTransaction({
          amount: cartTotal,
          orderId: result.id,
          email: formData.email,
          phone: formData.phone,
          name: formData.name
        });

        if (initData.success && initData.txnToken) {
          const scriptLoaded = await loadPaytmScript(initData.mid, initData.paytmHost);
          if (!scriptLoaded) {
            throw new Error("Failed to load Paytm checkout SDK script.");
          }

          const config = {
            root: "",
            flow: "DEFAULT",
            data: {
              orderId: result.id,
              token: initData.txnToken,
              tokenType: "TXN_TOKEN",
              amount: initData.amount
            },
            handler: {
              notifyMerchant: function(eventName: string, data: any) {
                console.log("Paytm event:", eventName, data);
              }
            }
          };

          if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
            (window as any).Paytm.CheckoutJS.init(config).then(() => {
              (window as any).Paytm.CheckoutJS.invoke();
            }).catch((err: any) => {
              console.error("Paytm invocation error:", err);
              alert("Could not load Paytm checkout interface. Please try again.");
            });
          }
        } else {
          throw new Error("Failed to initiate Paytm payment session.");
        }
      }
    } catch (error: any) {
      console.error("Order error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-background pt-40 text-center">
        <Navbar />
        <h2 className="text-3xl font-serif text-white mb-6">Your bag is empty</h2>
        <button 
          onClick={() => router.push("/menu")}
          className="px-8 py-3 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm"
        >
          Browse Menu
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-40 pb-24 px-6 md:px-12 container mx-auto">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <h1 className="text-4xl font-serif text-gradient-gold mb-8 uppercase tracking-widest">Checkout</h1>
          
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 space-y-6">
              <h3 className="text-lg font-serif text-white uppercase tracking-widest border-b border-[var(--surface-border)] pb-4 mb-6">Shipping Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" name="name" placeholder="Full Name" required 
                  onChange={handleInputChange}
                  className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:border-[var(--gold-primary)] outline-none" 
                />
                <input 
                  type="email" name="email" placeholder="Email Address" required 
                  onChange={handleInputChange}
                  className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:border-[var(--gold-primary)] outline-none" 
                />
              </div>
              
              <input 
                type="text" name="phone" placeholder="Phone Number" required 
                onChange={handleInputChange}
                className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:border-[var(--gold-primary)] outline-none" 
              />
              
              <div className="relative">
                <input 
                  type="text" name="address" placeholder="Delivery Address" required 
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-[var(--surface-border)] p-4 pr-12 text-white focus:border-[var(--gold-primary)] outline-none" 
                />
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--gold-primary)] hover:text-white transition-colors disabled:opacity-50"
                  title="Detect My Location"
                >
                  {isLocating ? (
                    <div className="w-5 h-5 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Navigation size={20} />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" name="city" placeholder="City" required 
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:border-[var(--gold-primary)] outline-none" 
                />
                <input 
                  type="text" name="zipCode" placeholder="Zip Code" required 
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:border-[var(--gold-primary)] outline-none" 
                />
              </div>
            </div>

            <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8">
              <h3 className="text-lg font-serif text-white uppercase tracking-widest border-b border-[var(--surface-border)] pb-4 mb-6">Payment Method</h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === "COD"} 
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-[var(--gold-primary)]" 
                  />
                  <span className="text-gray-300 group-hover:text-white">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === "Paytm"}
                    onChange={() => setPaymentMethod("Paytm")}
                    className="accent-[var(--gold-primary)]" 
                  />
                  <span className="text-gray-300 group-hover:text-white">Pay Online via Paytm</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-[0.3em] text-sm hover:bg-white transition-all duration-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order Now"}
            </button>
          </form>
        </motion.div>

        {/* Summary Section */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-96"
        >
          <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 sticky top-32">
            <h3 className="text-lg font-serif text-white uppercase tracking-widest border-b border-[var(--surface-border)] pb-4 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400 font-light">{item.name} x {item.quantity}</span>
                  <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-[var(--surface-border)]">
              <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                <span>Delivery</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-white font-serif uppercase tracking-widest">Total</span>
                <span className="text-3xl font-serif text-gradient-gold">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
