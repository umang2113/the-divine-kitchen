"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  CalendarClock
} from "lucide-react";
import { getDashboardStats } from "@/lib/api";
import Link from "next/link";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      if (data) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setUpcomingReservations(data.upcomingReservations);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null; // Layout handles main loader

  const cards = [
    { label: "Revenue", value: stats?.totalRevenue || "₹0.00", icon: TrendingUp },
    { label: "Orders", value: stats?.totalOrders || "0", icon: ShoppingBag },
    { label: "Reservations", value: stats?.totalReservations || "0", icon: CalendarClock },
    { label: "Customers", value: stats?.totalCustomers || "0", icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={48} className="text-[var(--gold-primary)]" />
              </div>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">{stat.label}</p>
              <p className="text-3xl font-serif text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif text-white uppercase tracking-widest">Recent Orders</h3>
            <Link href="/admin/orders" className="text-[10px] uppercase text-[var(--gold-primary)] font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center p-4 border border-[var(--surface-border)]/50 bg-black/20">
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">{order.shippingDetails?.name || "Customer"}</p>
                  <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">#{order.id.slice(-6)}</p>
                </div>
                <p className="text-[var(--gold-primary)] font-serif text-lg">₹{order.totalAmount || "0.00"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif text-white uppercase tracking-widest">Upcoming Tables</h3>
            <Link href="/admin/reservations" className="text-[10px] uppercase text-[var(--gold-primary)] font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {upcomingReservations.map((res: any) => (
              <div key={res.id} className="flex justify-between items-center p-4 border border-[var(--surface-border)]/50 bg-black/20">
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">{res.name}</p>
                  <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">{res.date} • {res.time}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-white/5 px-2 py-1">{res.guests} Guests</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
