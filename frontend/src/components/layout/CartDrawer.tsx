"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--surface-dark)] z-[70] shadow-2xl border-l border-[var(--surface-border)] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--surface-border)] flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-[var(--gold-primary)]" />
                <h2 className="text-xl font-serif text-white uppercase tracking-widest">Your Bag</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[var(--surface-border)]/30 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag size={32} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 font-light italic">Your bag is currently empty.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[var(--gold-primary)] uppercase tracking-widest text-xs font-bold hover:underline"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-[var(--surface-border)]/20 shrink-0 overflow-hidden flex items-center justify-center">
                      {(item.image || item.imageUrl) ? (
                        <img src={item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ShoppingBag size={24} className="text-gray-700" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-white font-serif text-sm uppercase tracking-wider">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[var(--gold-primary)] font-serif">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-[var(--surface-border)] bg-black/20">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-[var(--gold-primary)] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white text-xs w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-[var(--gold-primary)] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-black/40 border-t border-[var(--surface-border)] space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span className="uppercase tracking-widest text-xs font-light">Subtotal</span>
                  <span className="text-2xl font-serif text-gradient-gold">₹{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">
                  Shipping and taxes calculated at checkout
                </p>
                <Link 
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-4 bg-[var(--gold-primary)] text-black text-center font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300"
                >
                  Checkout Now
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
