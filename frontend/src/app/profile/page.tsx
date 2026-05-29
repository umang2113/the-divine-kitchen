"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"; // Force recompile
import { getProfile, updateProfile } from "@/lib/api";
import { User, Phone, Mail, Shield, LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setFormData({
        name: data.name || "",
        phone: data.phone || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Redirect to login if token is invalid or missing
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
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
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest"
          >
            My <span className="text-gradient-gold italic">Account</span>
          </motion.h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Sidebar Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 text-center">
              <div className="w-24 h-24 bg-black border border-[var(--gold-primary)] rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
                <User size={40} className="text-[var(--gold-primary)]" />
              </div>
              <h3 className="text-xl font-serif text-white uppercase tracking-wider mb-2">{user?.name}</h3>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Member Since {new Date(user?.createdAt).getFullYear()}</p>
              
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-[10px] font-bold uppercase tracking-widest border border-[var(--gold-primary)]/20 rounded-full">
                  {user?.role}
                </span>
                <span className="px-3 py-1 bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-full flex items-center gap-2">
                  <Shield size={10} /> Verified
                </span>
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--surface-border)]">
                 <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Loyalty Points</p>
                 <p className="text-3xl font-serif text-[var(--gold-primary)]">{user?.loyaltyPoints || 0}</p>
                 <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">Earn points with every culinary journey</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-4 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </motion.div>

          {/* Settings Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <form onSubmit={handleUpdate} className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 md:p-12 space-y-8">
              <h3 className="text-lg font-serif text-white uppercase tracking-widest border-b border-[var(--surface-border)] pb-4">Personal Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black border border-[var(--surface-border)] p-4 pl-12 text-white focus:border-[var(--gold-primary)] outline-none transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">Email Address</label>
                  <div className="relative opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="email" 
                      value={user?.email}
                      disabled
                      className="w-full bg-black border border-[var(--surface-border)] p-4 pl-12 text-white cursor-not-allowed" 
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-600 italic">Email cannot be changed for security reasons.</p>
                </div>

                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black border border-[var(--surface-border)] p-4 pl-12 text-white focus:border-[var(--gold-primary)] outline-none transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-5 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-white transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
