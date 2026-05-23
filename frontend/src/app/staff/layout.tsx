"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Grid, 
  ChefHat, 
  ToggleRight, 
  Receipt,
  LogOut,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    // Allow both admin and staff to view staff panel if needed, or strictly staff
    if (!token || (role !== "staff" && role !== "admin")) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-primary)]"></div>
    </div>
  );

  const navItems = [
    { id: "overview", name: "Dashboard", icon: LayoutDashboard, href: "/staff" },
    { id: "pos", name: "POS / New Order", icon: ShoppingCart, href: "/staff/pos" },
    { id: "tables", name: "Table Management", icon: Grid, href: "/staff/tables" },
    { id: "orders", name: "Active Orders", icon: ChefHat, href: "/staff/orders" },
    { id: "menu", name: "Menu Status", icon: ToggleRight, href: "/staff/menu" },
    { id: "billing", name: "Shift Report", icon: Receipt, href: "/staff/billing" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed left-0 top-0 h-full w-64 bg-[var(--surface-dark)] border-r border-[var(--surface-border)] z-50 flex flex-col transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h2 className="text-2xl font-serif text-gradient-gold uppercase tracking-widest">Staff</h2>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
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
        
        <div className="p-4 border-t border-[var(--surface-border)] space-y-2 bg-[var(--surface-dark)]">
           <Link href="/" className="flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-all">
             <ArrowLeft size={18} /> Back to Store
           </Link>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-red-500/60 hover:text-red-500 transition-all">
             <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex-1 min-h-screen p-4 sm:p-6 md:p-12 overflow-x-hidden flex flex-col">
        <header className="flex justify-between items-center mb-8 md:mb-12 gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-serif text-white uppercase tracking-widest leading-tight">
                {navItems.find(i => i.href === pathname)?.name || "Staff Panel"}
              </h1>
              <p className="text-gray-500 text-[9px] sm:text-[10px] mt-1 uppercase tracking-widest">The Divine Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest">Staff Member</p>
              <p className="text-gray-500 text-[10px]">staff@thedivine.com</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center text-black font-bold shadow-lg">S</div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-[100vw] lg:max-w-none overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
