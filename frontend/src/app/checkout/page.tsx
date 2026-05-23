"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";
import { placeOrder, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Razorpay">("COD");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    latitude: null as number | null,
    longitude: null as number | null
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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
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

  const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.state_district || "",
          zipCode: data.address?.postcode || "",
          latitude,
          longitude
        }));
      } else {
        setFormData(prev => ({ ...prev, address: `Lat: ${latitude}, Lng: ${longitude}`, latitude, longitude }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setFormData(prev => ({ ...prev, address: `Lat: ${latitude}, Lng: ${longitude}`, latitude, longitude }));
    } finally {
      setIsLocating(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    
    // Attempt 1: High Accuracy (GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchAddressFromCoords(position.coords.latitude, position.coords.longitude);
      }, 
      (error) => {
        console.warn("High accuracy failed, falling back to standard accuracy...", error);
        
        // Attempt 2: Fallback to standard accuracy (Network/WiFi)
        navigator.geolocation.getCurrentPosition(
          (fallbackPosition) => {
            fetchAddressFromCoords(fallbackPosition.coords.latitude, fallbackPosition.coords.longitude);
          },
          (fallbackError) => {
            console.error("Fallback location error:", fallbackError);
            alert("Unable to detect location. Please manually enter your address or check if location permissions are allowed for this site.");
            setIsLocating(false);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
        paymentMethod: paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay Online"
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
        // Razorpay online payment flow
        const initData = await createRazorpayOrder({
          amount: cartTotal,
          orderId: result.id,
          email: formData.email,
          phone: formData.phone,
          name: formData.name
        });

        if (initData.success && initData.razorpayOrderId) {
          // If the backend returns the dummy key, bypass the actual Razorpay SDK and directly verify
          if (initData.keyId === 'YOUR_KEY_ID_HERE' || initData.keyId.includes('dummy')) {
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: initData.razorpayOrderId,
              razorpay_payment_id: `mock_payment_${Date.now()}`,
              razorpay_signature: 'mock_signature',
              orderId: result.id
            });

            if (verificationResult.success) {
              clearCart();
              router.push(`/my-orders?payment=success&orderId=${result.id}`);
            } else {
              router.push(`/checkout?payment=failed&msg=Payment verification failed.`);
            }
            return;
          }

          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            throw new Error("Failed to load Razorpay checkout SDK script.");
          }

          const options = {
            key: initData.keyId,
            amount: initData.amount,
            currency: "INR",
            name: "THE DIVINE",
            description: "Restaurant Order Payment",
            order_id: initData.razorpayOrderId,
            handler: async function (response: any) {
              try {
                // Verify payment on backend
                const verificationResult = await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: result.id
                });

                if (verificationResult.success) {
                  clearCart();
                  router.push(`/my-orders?payment=success&orderId=${result.id}`);
                } else {
                  router.push(`/checkout?payment=failed&msg=Payment verification failed.`);
                }
              } catch (err: any) {
                console.error("Verification error", err);
                router.push(`/checkout?payment=failed&msg=Verification error occurred.`);
              }
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: "#00baf2"
            }
          };

          const paymentObject = new (window as any).Razorpay(options);
          paymentObject.on("payment.failed", function (response: any) {
            alert(`Payment Failed: ${response.error.description}`);
            router.push(`/checkout?payment=failed&msg=${encodeURIComponent(response.error.description)}`);
          });
          paymentObject.open();

        } else {
          throw new Error("Failed to initiate Razorpay payment session.");
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
                    checked={paymentMethod === "Razorpay"}
                    onChange={() => setPaymentMethod("Razorpay")}
                    className="accent-[var(--gold-primary)]" 
                  />
                  <span className="text-gray-300 group-hover:text-white">Pay Online via Razorpay</span>
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
                  <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-[var(--surface-border)]">
              <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                <span>Delivery</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-white font-serif uppercase tracking-widest">Total</span>
                <span className="text-3xl font-serif text-gradient-gold">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
