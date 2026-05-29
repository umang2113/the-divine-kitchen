"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Check, X, PhoneCall } from "lucide-react";
import { getAllReservations, updateReservationStatus } from "@/lib/api";

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await getAllReservations();
      // Sort by date (closest first)
      const sorted = data.sort((a: any, b: any) => 
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
      );
      setReservations(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateReservationStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="text-white">Loading Reservations...</div>;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-6 min-h-screen">
      <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6 flex items-center gap-2">
        <Calendar size={24} className="text-[var(--gold-primary)]" /> Table Reservations
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reservations.map((res) => (
          <motion.div 
            key={res.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg p-5 flex flex-col ${
              res.status === 'pending' ? 'bg-black/50 border-yellow-500/30' :
              res.status === 'confirmed' ? 'bg-green-900/10 border-green-500/30' :
              res.status === 'completed' ? 'bg-gray-900/50 border-gray-700 opacity-60' :
              'bg-red-900/10 border-red-500/30 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">{res.name}</h3>
                <a href={`tel:${res.phone}`} className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-1">
                  <PhoneCall size={12} /> {res.phone}
                </a>
              </div>
              <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${
                res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                res.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                res.status === 'completed' ? 'bg-gray-500/10 text-gray-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {res.status}
              </span>
            </div>

            <div className="space-y-2 mb-6 bg-black/40 p-3 rounded border border-white/5">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar size={16} className="text-[var(--gold-primary)]" /> {res.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock size={16} className="text-[var(--gold-primary)]" /> {res.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users size={16} className="text-[var(--gold-primary)]" /> {res.guests} Guests
              </div>
              {res.tableId && (
                <div className="text-xs text-[var(--gold-primary)] font-bold uppercase tracking-widest mt-2 pt-2 border-t border-white/10">
                  Table Preference: {res.tableId}
                </div>
              )}
            </div>

            <div className="mt-auto">
              {res.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                    className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-green-500/20 flex items-center justify-center gap-1"
                  >
                    <Check size={16} /> Confirm
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                    className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 flex items-center justify-center gap-1"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              )}
              {res.status === 'confirmed' && (
                <button 
                  onClick={() => handleStatusUpdate(res.id, 'completed')}
                  className="w-full bg-gray-800 text-gray-300 border border-gray-700 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-700 flex items-center justify-center gap-1"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {reservations.length === 0 && (
          <p className="text-gray-500 uppercase tracking-widest text-sm py-10 col-span-full text-center">No reservations found</p>
        )}
      </div>
    </div>
  );
}
