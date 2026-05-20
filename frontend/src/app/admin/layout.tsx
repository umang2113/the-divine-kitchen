"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CalendarClock, 
  UtensilsCrossed, 
  Users, 
  Settings,
  LogOut,
  ArrowLeft,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-primary)]"></div>
    </div>
  );

  const navItems = [
    { id: "overview", name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { id: "billing", name: "Billing", icon: Receipt, href: "/admin/billing" },
    { id: "orders", name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { id: "reservations", name: "Reservations", icon: CalendarClock, href: "/admin/reservations" },
    { id: "menu", name: "Menu Manager", icon: UtensilsCrossed, href: "/admin/menu" },
    { id: "customers", name: "Customers", icon: Users, href: "/admin/customers" },
    { id: "settings", name: "Settings", icon: Settings, href: "/admin/settings" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--surface-dark)] border-r border-[var(--surface-border)] z-50 hidden lg:flex flex-col">
        <div className="p-8">
          <h2 className="text-2xl font-serif text-gradient-gold uppercase tracking-widest">Admin</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "w-full flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-300",
                  isActive 
                    ? "bg-[var(--gold-primary)] text-black rounded" 
                    : "text-gray-500 hover:text-white hover:bg-white/5 rounded"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[var(--surface-border)] space-y-2">
           <Link href="/" className="flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-all">
             <ArrowLeft size={18} /> Back to Store
           </Link>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-red-500/60 hover:text-red-500 transition-all">
             <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex-1 min-h-screen p-6 md:p-12 overflow-x-hidden">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif text-white uppercase tracking-widest">
              {navItems.find(i => i.href === pathname)?.name || "Admin"}
            </h1>
            <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">The Divine Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-white text-xs font-bold uppercase tracking-widest">Administrator</p>
              <p className="text-gray-500 text-[10px]">admin@thedivine.com</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center text-black font-bold shadow-lg">A</div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
