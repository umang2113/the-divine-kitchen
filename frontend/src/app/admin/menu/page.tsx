"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, UtensilsCrossed, UploadCloud, Loader2, Check } from "lucide-react";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadImage } from "@/lib/api";

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, category: "starters", imageUrl: "", isSpecial: false
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, imageUrl: url });
    } catch (err: any) {
      alert("Upload failed: " + (err.message || "Unknown error"));
      console.error("Upload Error:", err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await createMenuItem(formData);
      }
      setShowModal(false);
      fetchMenu();
    } catch (err) {
      alert("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this item?")) {
      await deleteMenuItem(id);
      fetchMenu();
    }
  };

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center bg-[var(--surface-dark)] p-8 border border-[var(--surface-border)]">
        <div>
          <h2 className="text-xl font-serif text-white uppercase tracking-widest">Menu Collection</h2>
          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">{menuItems.length} Total Items</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setFormData({ name:"", description:"", price:0, category:"starters", imageUrl:"", isSpecial:false }); setShowModal(true); }}
          className="px-8 py-3 bg-[var(--gold-primary)] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all duration-500 flex items-center gap-2"
        >
          <Plus size={14}/> Add New Dish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {menuItems.map(item => (
          <div key={item.id} className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-4 flex gap-6 hover:border-[var(--gold-primary)]/50 transition-all group">
            <div className="w-24 h-24 overflow-hidden shrink-0 bg-black/40 flex items-center justify-center">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <UtensilsCrossed className="text-gray-800"/>}
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">{item.name}</h4>
                <p className="text-[var(--gold-primary)] font-serif text-lg mt-1">₹{item.price}</p>
                <span className="text-[8px] uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5">{item.category}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors flex items-center gap-1"><Edit2 size={10}/> Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-[10px] text-red-500/40 hover:text-red-500 uppercase tracking-widest font-bold transition-colors flex items-center gap-1"><Trash2 size={10}/> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[var(--surface-dark)] border border-[var(--surface-border)] w-full max-w-lg p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-serif text-white mb-8 uppercase tracking-widest">{editingItem ? "Edit Dish" : "Add New Dish"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Dish Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={isNaN(formData.price) ? "" : formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value === "" ? 0 : parseFloat(e.target.value)})} 
                      className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none appearance-none">
                      <option value="starters">Starters</option>
                      <option value="mains">Mains</option>
                      <option value="desserts">Desserts</option>
                      <option value="drinks">Drinks</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Dish Image</label>
                    <label className="text-[8px] text-[var(--gold-primary)] uppercase tracking-widest font-bold cursor-pointer hover:text-white transition-colors">
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                      <div className="flex items-center gap-1">
                        {uploading ? <Loader2 size={10} className="animate-spin"/> : <UploadCloud size={10}/>}
                        {uploading ? "Uploading..." : "Upload from Computer"}
                      </div>
                    </label>
                  </div>
                  <div className="relative group">
                    <input 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                      placeholder="Or paste an image URL here..."
                      className="w-full bg-background border border-[var(--surface-border)] p-3 pr-10 text-white text-xs focus:border-[var(--gold-primary)] outline-none" 
                    />
                    {formData.imageUrl && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <Check size={14}/>
                      </div>
                    )}
                  </div>
                  {formData.imageUrl && (
                    <div className="w-full h-32 border border-[var(--surface-border)] bg-black/40 overflow-hidden">
                       <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain p-2"/>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none resize-none" required />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold hover:text-white">Cancel</button>
                  <button type="submit" className="px-10 py-3 bg-[var(--gold-primary)] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">Save Dish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
