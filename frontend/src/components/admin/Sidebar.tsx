"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, CalendarCheck, Users, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

const sidebarLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[var(--surface-dark)] border-r border-[var(--surface-border)] h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-[var(--surface-border)]">
        <h2 className="text-2xl font-serif tracking-widest text-gradient-gold uppercase">
          The Divine
        </h2>
        <span className="text-xs text-gray-500 uppercase tracking-widest mt-1 block">Admin Panel</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 text-sm font-medium",
                isActive 
                  ? "bg-[var(--gold-primary)] text-black" 
                  : "text-gray-400 hover:text-white hover:bg-[var(--surface-border)]"
              )}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--surface-border)]">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-400/10 rounded-md transition-colors duration-200 text-sm font-medium">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
