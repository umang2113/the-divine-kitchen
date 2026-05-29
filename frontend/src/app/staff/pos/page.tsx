"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, X, Printer } from "lucide-react";
import ThermalReceipt from "@/components/ThermalReceipt";

interface MenuItem {
  id: string;
  catalogue_name?: string;
  name?: string;
  current_price: number;
  isAvailable: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function POSSystem() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/menu`)
      .then(res => res.json())
      .then(data => setMenu(data.filter((i: any) => i.isAvailable)))
      .catch(err => console.error(err));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.current_price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (orderType === "dine_in" && !tableNumber) {
      alert("Please enter a table number for Dine-in orders");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: cart.map(c => ({ menuItem: c.id, quantity: c.quantity, priceAtTime: c.current_price, name: c.catalogue_name || c.name })),
        totalAmount: total,
        source: "pos",
        orderType,
        tableNumber: orderType === "dine_in" ? tableNumber : null,
        paymentMethod
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (res.ok) {
        setLastOrder(data);
        setCart([]);
        setTableNumber("");
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Menu Area */}
      <div className="flex-1 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-6 overflow-y-auto">
        <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Menu Items</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menu.map(item => (
            <div 
              key={item.id} 
              onClick={() => addToCart(item)}
              className="bg-black/50 border border-[var(--surface-border)] p-4 rounded hover:border-[var(--gold-primary)] cursor-pointer transition-colors flex flex-col justify-between"
            >
              <h3 className="text-white text-sm font-bold mb-2">{item.catalogue_name || item.name}</h3>
              <p className="text-[var(--gold-primary)] font-serif">₹{item.current_price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-96 bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <ShoppingCart size={20} /> Current Order
        </h2>

        <div className="space-y-4 mb-6">
          <select 
            value={orderType} 
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full bg-black/50 border border-[var(--surface-border)] p-2 text-white rounded text-sm uppercase tracking-widest focus:border-[var(--gold-primary)] outline-none"
          >
            <option value="dine_in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
          
          {orderType === "dine_in" && (
            <input 
              type="text" 
              placeholder="Table Number (e.g. T1)" 
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full bg-black/50 border border-[var(--surface-border)] p-2 text-white rounded text-sm focus:border-[var(--gold-primary)] outline-none"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center text-sm uppercase tracking-widest mt-10">Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-[var(--surface-border)] pb-2">
                <div className="flex-1">
                  <p className="text-white text-sm font-bold truncate max-w-[150px]">{item.catalogue_name || item.name}</p>
                  <p className="text-[var(--gold-primary)] text-xs font-serif">₹{item.current_price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-black/50 rounded border border-[var(--surface-border)]">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-400 hover:text-white"><Minus size={14}/></button>
                    <span className="text-white text-xs w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-400 hover:text-white"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 p-1"><X size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-[var(--surface-border)] mt-4">
          <div className="flex justify-between text-white font-bold font-serif text-lg mb-4">
            <span>Total:</span>
            <span className="text-[var(--gold-primary)]">₹{total}</span>
          </div>

          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full bg-black/50 border border-[var(--surface-border)] p-2 text-white rounded text-sm uppercase tracking-widest focus:border-[var(--gold-primary)] outline-none mb-4"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>

          <button 
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-[var(--gold-primary)] text-black py-3 rounded font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Complete Order"}
          </button>
        </div>
      </div>

      {/* Success / Print Modal */}
      <AnimatePresence>
        {lastOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm print:hidden"
          >
            <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-8 rounded-xl w-full max-w-md text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer size={32} />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Order Success!</h2>
              <p className="text-gray-400 mb-6">Order #{lastOrder.id.slice(-6)} has been placed.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-white transition-colors"
                >
                  Print Bill
                </button>
                <button 
                  onClick={() => setLastOrder(null)}
                  className="flex-1 py-3 bg-gray-800 text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  New Order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Printable Receipt */}
      {lastOrder && (
        <ThermalReceipt 
          orderId={lastOrder.id}
          tableNumber={lastOrder.tableNumber}
          orderType={lastOrder.orderType}
          items={lastOrder.items}
          totalAmount={lastOrder.totalAmount}
          paymentMethod={lastOrder.paymentMethod}
          customerName={lastOrder.shippingDetails?.name}
          customerPhone={lastOrder.shippingDetails?.phone}
          createdAt={lastOrder.createdAt}
        />
      )}
    </div>
  );
}
