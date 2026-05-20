"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllReservations, getMenuItems } from "@/lib/api";
import { Search, Plus, Minus, Trash2, Printer, X, CreditCard } from "lucide-react";
import clsx from "clsx";

export default function AdminBilling() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Billing State
  const [selectedRes, setSelectedRes] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInvoiceReady, setIsInvoiceReady] = useState(false);
  const [paymentMode, setPaymentMode] = useState("Cash");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resData, menuData] = await Promise.all([
        getAllReservations(),
        getMenuItems()
      ]);
      // Only show confirmed reservations for today
      const today = new Date().toISOString().split('T')[0];
      setReservations(resData.filter((r: any) => r.status === 'confirmed' && r.date === today));
      setMenuItems(menuData);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const deposit = selectedRes?.amount || 0;
  const total = Math.max(0, subtotal + tax - deposit);

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-200px)]">
      
      {/* Left Side: Menu Selection */}
      <div className="w-full lg:w-2/3 space-y-6">
        <header className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
              <input 
                type="text" 
                placeholder="Search Menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-[var(--surface-border)] pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors"
              />
           </div>
           <div className="flex gap-2">
              {['All', 'Appetizers', 'Main Course', 'Desserts', 'Drinks'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
                   className="px-4 py-2 border border-[var(--surface-border)] text-[8px] uppercase tracking-widest font-bold text-gray-500 hover:text-[var(--gold-primary)] hover:border-[var(--gold-primary)] transition-all"
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {filteredMenu.map(item => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={item.id} 
                onClick={() => addToCart(item)}
                className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-4 cursor-pointer hover:border-[var(--gold-primary)] transition-all group"
              >
                 <div className="aspect-video bg-black mb-4 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <h4 className="text-white text-xs font-serif uppercase tracking-widest mb-1">{item.name}</h4>
                 <p className="text-[var(--gold-primary)] text-xs font-bold">₹{item.price}</p>
              </motion.div>
           ))}
        </div>
      </div>

      {/* Right Side: Bill Summary */}
      <div className="w-full lg:w-1/3">
         <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] flex flex-col h-full sticky top-24">
            <div className="p-6 border-b border-[var(--surface-border)]">
               <h3 className="text-white font-serif text-xl mb-6 uppercase tracking-widest">Active Order</h3>
               <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Select Customer / Table</label>
                  <select 
                    value={selectedRes?.id || ""} 
                    onChange={(e) => setSelectedRes(reservations.find(r => r.id === e.target.value))}
                    className="w-full bg-black border border-[var(--surface-border)] p-3 text-white text-xs focus:outline-none appearance-none mb-4"
                  >
                     <option value="">Walk-in Customer</option>
                     {reservations.map(res => (
                        <option key={res.id} value={res.id}>Table {res.tableId} - {res.name}</option>
                     ))}
                  </select>

                  <div className="pt-4 border-t border-[var(--surface-border)]">
                     <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-3">Add Custom Item</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="custom-name"
                          placeholder="Item Name" 
                          className="flex-grow bg-black border border-[var(--surface-border)] p-2 text-[10px] text-white focus:border-[var(--gold-primary)] outline-none"
                        />
                        <input 
                          type="number" 
                          id="custom-price"
                          placeholder="Price" 
                          className="w-20 bg-black border border-[var(--surface-border)] p-2 text-[10px] text-white focus:border-[var(--gold-primary)] outline-none"
                        />
                        <button 
                          onClick={() => {
                            const name = (document.getElementById('custom-name') as HTMLInputElement).value;
                            const price = parseFloat((document.getElementById('custom-price') as HTMLInputElement).value);
                            if(name && price) {
                              addToCart({ id: `custom-${Date.now()}`, name, price, category: 'Custom' });
                              (document.getElementById('custom-name') as HTMLInputElement).value = "";
                              (document.getElementById('custom-price') as HTMLInputElement).value = "";
                            }
                          }}
                          className="p-2 bg-[var(--gold-primary)] text-black hover:bg-white transition-colors"
                        >
                          <Plus size={16}/>
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto max-h-[400px] space-y-4">
               {cart.length === 0 ? (
                  <div className="text-center py-20">
                     <p className="text-gray-600 text-[10px] uppercase tracking-widest">Cart is empty</p>
                  </div>
               ) : (
                  cart.map(item => (
                     <div key={item.id} className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                        <div className="flex-grow">
                           <h5 className="text-white text-[10px] uppercase tracking-widest font-bold">{item.name}</h5>
                           <p className="text-[var(--gold-primary)] text-[10px]">₹{item.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-2 border border-[var(--surface-border)] px-2 py-1">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-white"><Minus size={12}/></button>
                              <span className="text-white text-xs min-w-[20px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-white"><Plus size={12}/></button>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                     </div>
                  ))
               )}
            </div>

            <div className="p-6 bg-black/40 border-t border-[var(--surface-border)] space-y-3">
               <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-gray-500">Tax (GST 5%)</span>
                  <span className="text-white">₹{tax.toFixed(2)}</span>
               </div>
               {selectedRes && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-green-500">
                     <span>Reservation Deposit</span>
                     <span>- ₹{deposit.toFixed(2)}</span>
                  </div>
               )}
               <div className="flex justify-between text-lg font-serif border-t border-[var(--surface-border)] pt-4 mt-2">
                  <span className="text-white uppercase tracking-widest">Total</span>
                  <span className="text-[var(--gold-primary)]">₹{total.toFixed(2)}</span>
               </div>

               <div className="pt-6">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-3">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                     {['Cash', 'Card', 'UPI'].map(mode => (
                        <button 
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={clsx(
                            "py-2 border text-[9px] uppercase tracking-tighter font-bold transition-all",
                            paymentMode === mode ? "bg-[var(--gold-primary)] text-black border-[var(--gold-primary)]" : "border-[var(--surface-border)] text-gray-500 hover:text-white"
                          )}
                        >
                           {mode}
                        </button>
                     ))}
                  </div>
               </div>

               <button 
                 onClick={() => setIsInvoiceReady(true)}
                 disabled={cart.length === 0}
                 className="w-full mt-6 py-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2"
               >
                  <CreditCard size={16}/> Complete Payment
               </button>
            </div>
         </div>
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
         {isInvoiceReady && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInvoiceReady(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-lg bg-white p-12 text-black font-sans"
               >
                  <button onClick={() => setIsInvoiceReady(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black print:hidden">
                     <X size={20}/>
                  </button>

                  <div id="invoice-print" className="space-y-8">
                     <div className="text-center">
                        <h2 className="text-2xl font-serif uppercase tracking-widest mb-1">The Divine</h2>
                        <p className="text-[8px] uppercase tracking-widest text-gray-500 italic mb-4">Haute Cuisine Experience</p>
                        <div className="border-y border-gray-100 py-2 flex justify-between text-[8px] uppercase font-bold">
                           <span>Invoice #INV-{Math.floor(Math.random()*90000) + 10000}</span>
                           <span>{new Date().toLocaleDateString()}</span>
                        </div>
                     </div>

                     <div className="text-[10px]">
                        <p className="font-bold uppercase tracking-widest mb-2">Billing To:</p>
                        <p className="text-gray-600">{selectedRes?.name || "Walk-in Guest"}</p>
                        {selectedRes && <p className="text-gray-600">Table: {selectedRes.tableId}</p>}
                     </div>

                     <table className="w-full text-[10px]">
                        <thead className="border-b border-gray-100">
                           <tr className="text-left font-bold uppercase tracking-widest">
                              <th className="py-2">Item</th>
                              <th className="py-2 text-center">Qty</th>
                              <th className="py-2 text-right">Total</th>
                           </tr>
                        </thead>
                        <tbody>
                           {cart.map(item => (
                              <tr key={item.id} className="border-b border-gray-50">
                                 <td className="py-3 uppercase tracking-wider">{item.name}</td>
                                 <td className="py-3 text-center">{item.quantity}</td>
                                 <td className="py-3 text-right">₹{item.price * item.quantity}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>

                     <div className="space-y-2 pt-4 border-t-2 border-black border-dotted">
                        <div className="flex justify-between text-[10px] uppercase">
                           <span>Subtotal</span>
                           <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase">
                           <span>GST (5%)</span>
                           <span>₹{tax.toFixed(2)}</span>
                        </div>
                        {selectedRes && (
                           <div className="flex justify-between text-[10px] uppercase text-gray-500 italic">
                              <span>Reservation Deposit Credit</span>
                              <span>- ₹{deposit.toFixed(2)}</span>
                           </div>
                        )}
                        <div className="flex justify-between text-[10px] uppercase font-bold border-t border-gray-100 pt-2">
                           <span>Payment Method</span>
                           <span>{paymentMode}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-black pt-2 mt-2 uppercase">
                           <span>Amount Due</span>
                           <span>₹{total.toFixed(2)}</span>
                        </div>
                     </div>

                     <div className="text-center pt-8 border-t border-gray-100">
                        <p className="text-[8px] uppercase tracking-widest font-medium mb-1">Thank you for dining with us</p>
                        <p className="text-[7px] text-gray-400">Please visit again to experience the divine.</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="w-full mt-10 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 print:hidden"
                  >
                     <Printer size={16}/> Print Invoice
                  </button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
