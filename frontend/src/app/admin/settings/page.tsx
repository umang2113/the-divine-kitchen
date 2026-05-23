"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, IndianRupee, QrCode, Download } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/api";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    upiId: "",
  });
  const [appLink, setAppLink] = useState("https://thedivinekitchen.com");

  const downloadQRCode = () => {
    const canvas = document.getElementById("app-qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "TheDivineKitchen-QR.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      if (data) {
        setFormData({
          upiId: data.upiId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Global Settings</h2>
        <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">Manage your restaurant configurations</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 rounded-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <IndianRupee className="text-[var(--gold-primary)]" size={20} />
            <h3 className="text-lg font-serif text-white uppercase tracking-widest">Payment Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Business UPI ID</label>
              <input 
                type="text" 
                value={formData.upiId}
                onChange={e => setFormData({...formData, upiId: e.target.value})}
                placeholder="e.g. 9876543210@paytm or yourname@sbi"
                className="w-full bg-black border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
              />
              <p className="text-gray-500 text-[9px] mt-1">This UPI ID will be used to generate dynamic QR codes on the Billing page.</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 rounded-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <QrCode className="text-[var(--gold-primary)]" size={20} />
            <h3 className="text-lg font-serif text-white uppercase tracking-widest">App QR Code Generator</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-grow space-y-4 w-full">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">App / Website Link</label>
              <input 
                type="text" 
                value={appLink}
                onChange={e => setAppLink(e.target.value)}
                placeholder="https://thedivinekitchen.com"
                className="w-full bg-black border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none transition-colors"
              />
              <p className="text-gray-500 text-[9px] mt-1">Enter any link to generate a QR code. Customers can scan it to open your app.</p>
              
              <button 
                type="button"
                onClick={downloadQRCode}
                className="mt-4 px-6 py-3 border border-[var(--gold-primary)] text-[var(--gold-primary)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--gold-primary)] hover:text-black transition-all duration-500 flex items-center gap-2"
              >
                <Download size={14}/> Download QR Code Image
              </button>
            </div>
            
            {appLink && (
              <div className="bg-white p-4 rounded-sm flex-shrink-0 flex flex-col items-center">
                <QRCodeCanvas 
                  id="app-qr-code"
                  value={appLink}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-black text-[9px] uppercase tracking-widest mt-2 font-bold text-center">Scan to Visit</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* You can add more settings sections here in the future (like Opening Hours, Tax Rates, etc.) */}

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className={`px-8 py-4 bg-[var(--gold-primary)] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all duration-500 flex items-center gap-2 ${saving ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
