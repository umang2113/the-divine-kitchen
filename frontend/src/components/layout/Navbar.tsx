"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "Reservation", href: "/reservation" },
  { name: "Order History", href: "/my-orders" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check auth state
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = "/";
  };

  return (
    <>
    <header
      className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "glass py-4 border-[var(--surface-border)]" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="relative z-50">
          <h1 className="text-2xl md:text-3xl font-serif tracking-widest text-gradient-gold uppercase">
            The Divine
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[10px] xl:text-xs tracking-widest uppercase hover:text-[var(--gold-primary)] transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link 
                href={userRole === "admin" ? "/admin" : "/profile"} 
                className="text-sm uppercase tracking-widest hover:text-[var(--gold-primary)] transition-colors"
              >
                {userRole === "admin" ? "Dashboard" : "Profile"}
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm tracking-widest uppercase hover:text-[var(--gold-primary)] transition-colors duration-300"
            >
              Sign In
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="hover:text-[var(--gold-primary)] transition-colors relative ml-2"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--gold-primary)] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <Link
            href="/reservation"
            className="px-6 py-2 border border-[var(--gold-primary)] text-[var(--gold-primary)] hover:bg-[var(--gold-primary)] hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
          >
            Book a Table
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4 relative z-50">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="hover:text-[var(--gold-primary)] transition-colors relative"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--gold-primary)] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground hover:text-[var(--gold-primary)] transition-colors"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 z-40"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif tracking-widest text-gradient-gold uppercase"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-4 mt-4"
            >
              {isLoggedIn ? (
                <>
                  <Link 
                    href={userRole === "admin" ? "/admin" : "/profile"} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg uppercase tracking-widest text-gray-300 hover:text-[var(--gold-primary)]"
                  >
                    {userRole === "admin" ? "Dashboard" : "My Profile"}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-lg uppercase tracking-widest text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg uppercase tracking-widest text-gray-300 hover:text-[var(--gold-primary)]"
                >
                  Sign In
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Link
                href="/reservation"
                onClick={() => setMobileMenuOpen(false)}
                className="px-8 py-3 bg-[var(--gold-primary)] text-black uppercase tracking-widest text-sm font-bold"
              >
                Book a Table
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    <CartDrawer />
    </>
  );
}
