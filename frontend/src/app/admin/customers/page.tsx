"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllUsers } from "@/lib/api";
import clsx from "clsx";

export default function AdminCustomers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      const onlyCustomers = data.filter((u: any) => u.role === "customer" || !u.role);
      setUsers(onlyCustomers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 overflow-x-auto">
        <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-8">Registered Customers</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[var(--surface-border)]">
              <th className="pb-4 font-bold">User</th>
              <th className="pb-4 font-bold">Phone</th>
              <th className="pb-4 font-bold">Joined</th>
              <th className="pb-4 font-bold">Points</th>
              <th className="pb-4 font-bold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-[var(--surface-border)]/50 last:border-0 hover:bg-white/5 transition-colors">
                <td className="py-6 flex items-center gap-4">
                  <div className="w-8 h-8 bg-[var(--surface-border)] rounded-full flex items-center justify-center text-[var(--gold-primary)] text-[10px] font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold uppercase tracking-widest">{user.name}</p>
                    <p className="text-gray-500 text-[10px]">{user.email}</p>
                  </div>
                </td>
                <td className="py-6 text-gray-400 text-xs">{user.phone || "N/A"}</td>
                <td className="py-6 text-gray-400 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                <td className="py-6 text-[var(--gold-primary)] font-serif">{user.loyaltyPoints || 0}</td>
                <td className="py-6">
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                    user.role === "admin" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  )}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
