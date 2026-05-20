"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSettings } from "@/lib/api";

export default function ContactPage() {
  const [hours, setHours] = useState<any>(null);

  useEffect(() => {
    const fetchHours = async () => {
      const data = await getSettings();
      if (data && data.openingHours) {
        setHours(data.openingHours);
      }
    };
    fetchHours();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-40 pb-24 px-6 md:px-12 container mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 space-y-12"
          >
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold mb-6">Contact Us</h1>
              <p className="text-gray-400 font-light">Whether you have a question about our menu, reservations, or private events, we're here to help.</p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[var(--gold-primary)]" />
                </div>
                <div>
                  <h4 className="text-white uppercase tracking-widest text-xs font-bold mb-2">Location</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Ivanya Homes, Lavkush Nagar, Road Number - 04<br />Gola Road, Danapur - 801503</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-full flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-[var(--gold-primary)]" />
                </div>
                <div>
                  <h4 className="text-white uppercase tracking-widest text-xs font-bold mb-2">Reservations</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">+91 7488131872</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-full flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-[var(--gold-primary)]" />
                </div>
                <div>
                  <h4 className="text-white uppercase tracking-widest text-xs font-bold mb-2">Email</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">experience@thedivine.com<br />events@thedivine.com</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-full flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-[var(--gold-primary)]" />
                </div>
                <div>
                  <h4 className="text-white uppercase tracking-widest text-xs font-bold mb-2">Hours</h4>
                  <div className="text-gray-400 text-sm leading-relaxed space-y-1">
                    {hours && hours.length > 0 ? (
                      (() => {
                        const groups: any[] = [];
                        let currentGroup: any = null;

                        hours.forEach((day: any, index: number) => {
                          const timingStr = day.isOpen ? `${day.open} - ${day.close}` : "Closed";
                          if (!currentGroup || currentGroup.timing !== timingStr) {
                            if (currentGroup) groups.push(currentGroup);
                            currentGroup = { startDay: day.day, endDay: day.day, timing: timingStr };
                          } else {
                            currentGroup.endDay = day.day;
                          }
                          if (index === hours.length - 1) groups.push(currentGroup);
                        });

                        return groups.map((group, i) => (
                          <p key={i}>
                            {group.startDay}{group.startDay !== group.endDay ? ` - ${group.endDay}` : ""}: <span className={group.timing === "Closed" ? "text-red-500/80" : "text-white/80"}>{group.timing}</span>
                          </p>
                        ));
                      })()
                    ) : (
                      <>
                        <p>Mon - Thu: 5:00 PM - 11:00 PM</p>
                        <p>Fri - Sun: 12:00 PM - 12:00 AM</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-light)] to-[var(--gold-dark)]" />
              
              <h2 className="text-3xl font-serif text-white mb-8">Send a Message</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Your Name</label>
                    <input type="text" className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Email Address</label>
                    <input type="email" className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-widest">Subject</label>
                  <select className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors appearance-none">
                    <option>General Inquiry</option>
                    <option>Private Events</option>
                    <option>Press & Media</option>
                    <option>Careers</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-widest">Message</label>
                  <textarea rows={6} className="w-full bg-background border border-[var(--surface-border)] p-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors resize-none" />
                </div>

                <button type="submit" className="px-12 py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300">
                  Send Message
                </button>
              </form>
            </div>

            {/* Map Placeholder */}
            <a 
              href="https://maps.app.goo.gl/49jhEHcmgiJbTAuEA?g_st=ac" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 aspect-video border border-[var(--surface-border)] relative overflow-hidden group block"
            >
               <img 
                 src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2033&auto=format&fit=crop" 
                 alt="Map Placeholder" 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="bg-[var(--surface-dark)] border border-[var(--gold-primary)] px-8 py-4 text-white font-serif uppercase tracking-widest">
                    Open in Google Maps
                  </div>
               </div>
            </a>
          </motion.div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
