"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { getSettings } from "@/lib/api";
import clsx from "clsx";

export default function Footer() {
  const [hours, setHours] = useState<any[]>([]);

  useEffect(() => {
    const fetchHours = async () => {
      const data = await getSettings();
      if (data && data.openingHours && Array.isArray(data.openingHours)) {
        setHours(data.openingHours);
      }
    };
    fetchHours();
  }, []);

  const renderHours = () => {
    if (!hours || hours.length === 0) {
      return (
        <>
          <li className="flex justify-between border-b border-[var(--surface-border)] pb-2">
            <span>Mon - Thu</span>
            <span>5:00 PM - 11:00 PM</span>
          </li>
          <li className="flex justify-between border-b border-[var(--surface-border)] pb-2">
            <span>Fri - Sat</span>
            <span>5:00 PM - 1:00 AM</span>
          </li>
          <li className="flex justify-between pb-2">
            <span>Sunday</span>
            <span>4:00 PM - 10:00 PM</span>
          </li>
        </>
      );
    }

    // Smart Grouping Logic
    const groups: any[] = [];
    let currentGroup: any = null;

    hours.forEach((day, index) => {
      const timingStr = day.isOpen ? `${day.open} - ${day.close}` : "Closed";
      
      if (!currentGroup || currentGroup.timing !== timingStr) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { 
          startDay: day.day.substring(0, 3), 
          endDay: day.day.substring(0, 3), 
          timing: timingStr 
        };
      } else {
        currentGroup.endDay = day.day.substring(0, 3);
      }

      if (index === hours.length - 1) {
        groups.push(currentGroup);
      }
    });

    return groups.map((group, i) => (
      <li 
        key={i} 
        className={clsx(
          "flex justify-between border-b border-[var(--surface-border)] pb-2",
          i === groups.length - 1 && "border-none"
        )}
      >
        <span>{group.startDay}{group.startDay !== group.endDay ? ` - ${group.endDay}` : ""}</span>
        <span className={group.timing === "Closed" ? "text-red-500/80" : ""}>{group.timing}</span>
      </li>
    ));
  };

  return (
    <footer className="bg-[#050505] border-t border-[var(--surface-border)] pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif tracking-widest text-gradient-gold uppercase">
              The Divine
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Experience the pinnacle of culinary excellence in an atmosphere of unparalleled luxury and sophistication.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--surface-border)] flex items-center justify-center hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--surface-border)] flex items-center justify-center hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--surface-border)] flex items-center justify-center hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 11.2 2.8 11.2c.5.3 1.2.3 1.8.2C1.4 10.3 1 7.1 1 7.1c.6.4 1.3.6 2 .6-2-1.3-2.6-4.5-1.5-6.6 2.3 2.8 6.5 4.8 11.2 5 0-3.6 4-5.5 6.6-3.4 1-.2 2-.8 2.8-1.2-1 2.2-2.5 3.5-2.5 3.5z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--gold-primary)] tracking-widest uppercase text-sm font-semibold mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', href: '/' },
                { name: 'Menu', href: '/menu' },
                { name: 'Reservation', href: '/reservation' },
                { name: 'Gallery', href: '/gallery' },
                { name: 'About', href: '/about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Join as Partner', href: '/delivery-signup' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[var(--gold-primary)] tracking-widest uppercase text-sm font-semibold mb-6">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="shrink-0 text-[var(--gold-primary)]" />
                <span>Ivanya Homes, Lavkush Nagar, Road Number - 04, Gola Road, Danapur - 801503</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={20} className="shrink-0 text-[var(--gold-primary)]" />
                <span>+91 7488131872</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={20} className="shrink-0 text-[var(--gold-primary)]" />
                <span>reservations@thedivine.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-[var(--gold-primary)] tracking-widest uppercase text-sm font-semibold mb-6">
              Opening Hours
            </h3>
            <ul className="space-y-4 text-gray-400">
              {renderHours()}
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-[var(--surface-border)] text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} The Divine Kitchen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
