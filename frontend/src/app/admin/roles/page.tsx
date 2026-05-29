"use client";

import { useState, useEffect } from "react";
import { Users, Shield, User, Car, ChefHat, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function RoleManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState("admin");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setCurrentRole(role);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const error = await res.json();
        alert(`Failed: ${error.message}`);
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system_admin': return <ShieldAlert size={16} className="text-purple-500" />;
      case 'admin': return <Shield size={16} className="text-[var(--gold-primary)]" />;
      case 'staff': return <ChefHat size={16} className="text-orange-400" />;
      case 'delivery_boy': return <Car size={16} className="text-green-400" />;
      default: return <User size={16} className="text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'system_admin': return 'System Admin';
      case 'admin': return 'Owner (Admin)';
      case 'staff': return 'Hotel Staff';
      case 'delivery_boy': return 'Delivery Partner';
      default: return 'Customer';
    }
  };

  if (loading) return <div className="text-white">Loading Users...</div>;

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 min-h-[80vh] rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-serif text-white uppercase tracking-widest flex items-center gap-2">
            <Users size={24} className="text-[var(--gold-primary)]" /> Role Management
          </h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Assign staff and delivery access</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--surface-border)]">
              <th className="p-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold">User</th>
              <th className="p-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold">Contact</th>
              <th className="p-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold">Current Role</th>
              <th className="p-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold">Assign New Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr 
                key={user.id}
                layout
                className="border-b border-[var(--surface-border)]/50 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <p className="text-white font-bold text-sm">{user.name || 'Unknown'}</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                  <p className="text-gray-300 text-xs">{user.email}</p>
                  <p className="text-gray-500 text-xs">{user.phone || 'No phone'}</p>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2 bg-black/50 border border-[var(--surface-border)] px-3 py-1 rounded-full w-fit">
                    {getRoleIcon(user.role || 'customer')}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">
                      {getRoleLabel(user.role || 'customer')}
                    </span>
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={user.role || 'customer'}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    disabled={user.role === 'system_admin' && currentRole !== 'system_admin'}
                    className="bg-black border border-[var(--surface-border)] text-white text-xs p-2 rounded focus:outline-none focus:border-[var(--gold-primary)] disabled:opacity-50"
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Hotel Staff</option>
                    <option value="delivery_boy">Delivery Partner</option>
                    <option value="admin">Owner (Admin)</option>
                    {currentRole === 'system_admin' && (
                      <option value="system_admin">System Admin</option>
                    )}
                  </select>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-500 py-10 text-xs uppercase tracking-widest">No users found</p>
        )}
      </div>
    </div>
  );
}
