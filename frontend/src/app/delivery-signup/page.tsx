"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { registerUser } from "@/lib/api";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Bike, 
  ChevronRight, 
  MessageCircle,
  Clock,
  ShieldCheck
} from "lucide-react";

export default function DeliverySignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    vehicleType: "Bike",
    licenseNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await registerUser({
        ...formData,
        role: "delivery_boy"
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      
      alert("Application Submitted! You are now a Delivery Partner.");
      router.push("/delivery");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[var(--gold-primary)]/10 to-transparent pointer-events-none" />

      <div className="pt-40 pb-24 px-6 md:px-12 container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div>
              <span className="text-[var(--gold-primary)] tracking-[0.4em] uppercase text-xs font-bold block mb-4">
                Join The Divine Team
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">
                Become a <br />
                <span className="text-gradient-gold italic">Delivery Partner</span>
              </h1>
            </div>

            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-lg">
              Deliver luxury culinary experiences to our exclusive clientele. Enjoy flexible hours, premium earnings, and become a part of the city's most prestigious kitchen network.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: <Clock className="text-[var(--gold-primary)]" />, title: "Flexible Hours", desc: "Work on your own schedule" },
                { icon: <ShieldCheck className="text-[var(--gold-primary)]" />, title: "Weekly Payouts", desc: "Get paid every Monday" },
                { icon: <Bike className="text-[var(--gold-primary)]" />, title: "Gear Provided", desc: "Premium delivery kits" },
                { icon: <MessageCircle className="text-[var(--gold-primary)]" />, title: "24/7 Support", desc: "Always here to help you" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-[var(--surface-border)]">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Questions? Contact HR</p>
              <div className="flex gap-4 text-white text-sm font-mono">
                <span>+91 7488131872</span>
                <span className="text-gray-700">|</span>
                <span>partners@thedivine.com</span>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--surface-dark)] p-8 md:p-12 border border-[var(--surface-border)] rounded-sm relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-light)] to-[var(--gold-dark)]" />
            
            <h3 className="text-2xl font-serif text-white mb-8 text-center uppercase tracking-widest">Apply Now</h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-xs mb-8 text-center uppercase tracking-widest">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type="tel" required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Vehicle Type</label>
                <select 
                  className="w-full bg-black/50 border border-[var(--surface-border)] py-3 px-4 text-white text-xs focus:border-[var(--gold-primary)] outline-none appearance-none"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                >
                  <option value="Bike">Bike / Motorcycle</option>
                  <option value="Scooter">Electric Scooter</option>
                  <option value="Cycle">Bicycle</option>
                  <option value="Car">Car (Premium Delivery)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">License Number</label>
                <input 
                  type="text" required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  className="w-full bg-black/50 border border-[var(--surface-border)] py-3 px-4 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
                  placeholder="e.g. DL-1234567890"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="password" required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all duration-500 flex items-center justify-center gap-2 mt-8"
              >
                {loading ? "Processing..." : <>Submit Application <ChevronRight size={16} /></>}
              </button>

              <p className="text-center text-[9px] text-gray-500 uppercase tracking-widest mt-6">
                By signing up, you agree to The Divine Partner Terms & Conditions.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
