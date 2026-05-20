"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/api";
import clsx from "clsx";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface DaySchedule {
  day: string;
  isOpen: boolean;
  open: string;
  close: string;
}

export default function AdminSettings() {
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map(day => ({ day, isOpen: true, open: "05:00 PM", close: "11:00 PM" }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      if (data && data.openingHours && Array.isArray(data.openingHours)) {
        setSchedules(data.openingHours);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules[index].isOpen = !newSchedules[index].isOpen;
    setSchedules(newSchedules);
  };

  const handleChange = (index: number, field: "open" | "close", value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await updateSettings({ openingHours: schedules });
      setMessage("Business hours updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl pb-20"
    >
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-serif text-white uppercase tracking-widest mb-2">Store Settings</h1>
          <p className="text-gray-500 text-sm italic">Manage your kitchen's business hours, WhatsApp style.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-sm overflow-hidden">
        <div className="p-8 border-b border-[var(--surface-border)] flex items-center gap-3">
          <Clock className="text-[var(--gold-primary)]" size={24} />
          <h2 className="text-xl font-serif text-white uppercase tracking-widest">Business Hours</h2>
        </div>

        <form onSubmit={handleSave} className="divide-y divide-[var(--surface-border)]">
          {schedules.map((item, index) => (
            <div key={item.day} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-6 min-w-[200px]">
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className={clsx(
                    "relative w-12 h-6 rounded-full transition-colors duration-300 outline-none",
                    item.isOpen ? "bg-[var(--gold-primary)]" : "bg-gray-700"
                  )}
                >
                  <motion.div
                    animate={{ x: item.isOpen ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
                <span className={clsx(
                  "font-medium tracking-wide",
                  item.isOpen ? "text-white" : "text-gray-500 line-through"
                )}>
                  {item.day}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-end gap-4">
                <AnimatePresence mode="wait">
                  {item.isOpen ? (
                    <motion.div 
                      key="open"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Opens At</span>
                        <input 
                          type="text" 
                          value={item.open}
                          onChange={(e) => handleChange(index, 'open', e.target.value)}
                          className="bg-black/40 border border-[var(--surface-border)] px-4 py-2 text-sm text-white focus:border-[var(--gold-primary)] outline-none w-32"
                        />
                      </div>
                      <div className="h-[1px] w-4 bg-gray-700 mt-6" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Closes At</span>
                        <input 
                          type="text" 
                          value={item.close}
                          onChange={(e) => handleChange(index, 'close', e.target.value)}
                          className="bg-black/40 border border-[var(--surface-border)] px-4 py-2 text-sm text-white focus:border-[var(--gold-primary)] outline-none w-32"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.span 
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-600 text-sm uppercase tracking-widest font-bold pr-8"
                    >
                      Closed
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}

          <div className="p-8 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-[var(--gold-primary)] text-sm font-bold uppercase tracking-wider"
                >
                  <CheckCircle2 size={18} />
                  {message}
                </motion.div>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={saving}
              className="px-12 py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Update Schedule"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-6 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded flex gap-4">
        <AlertCircle className="text-gray-500 shrink-0" size={20} />
        <p className="text-gray-500 text-xs leading-relaxed">
          These settings directly control the "Opening Hours" displayed in the footer and contact sections of the website. Marking a day as "Closed" will hide its timing and display it as "Closed" to your customers.
        </p>
      </div>
    </motion.div>
  );
}
