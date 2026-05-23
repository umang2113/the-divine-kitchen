"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, UtensilsCrossed, UploadCloud, Loader2, Check } from "lucide-react";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadImage } from "@/lib/api";
import Papa from "papaparse";

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    category_name: "", subcategory_name: "", catalogue_id: "", catalogue_name: "", variant_id: "", variant_name: "", current_price: 0, description: "", image_url: ""
  });

  const processCsvFile = (file: File) => {
    setIsBulkUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          let successCount = 0;
          for (const row of rows) {
            if (!row.catalogue_name && !row.category_name) continue; 
            
            await createMenuItem({
              category_name: row.category_name || "",
              subcategory_name: row.subcategory_name || "",
              catalogue_id: row.catalogue_id || "",
              catalogue_name: row.catalogue_name || "",
              variant_id: row.variant_id || "",
              variant_name: row.variant_name || "",
              current_price: parseFloat(row.current_price) || 0,
              description: row.description || "",
              image_url: row.image_url || ""
            });
            successCount++;
          }
          alert(`Successfully uploaded ${successCount} menu items!`);
          fetchMenu();
        } catch (error) {
          console.error("Bulk upload error:", error);
          alert("Error uploading some items. Check console for details.");
        } finally {
          setIsBulkUploading(false);
        }
      },
      error: (error: any) => {
        alert("Error parsing CSV file: " + error.message);
        setIsBulkUploading(false);
      }
    });
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
      e.target.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      processCsvFile(file);
    } else if (file) {
      alert("Please upload a valid .csv file.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, image_url: url });
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
        <div className="flex gap-4">
          <label 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`px-6 py-2 border-2 border-dashed ${isDragging ? 'border-[var(--gold-primary)] bg-[var(--gold-primary)]/10 text-[var(--gold-primary)]' : 'border-gray-500/50 text-gray-500 hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)]'} text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer min-w-[220px] ${isBulkUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} disabled={isBulkUploading} />
            {isBulkUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16}/>}
            {isBulkUploading ? 'Uploading...' : 'Drag & Drop CSV or Click'}
          </label>
          <button 
            onClick={() => { setEditingItem(null); setFormData({ category_name: "", subcategory_name: "", catalogue_id: "", catalogue_name: "", variant_id: "", variant_name: "", current_price: 0, description: "", image_url: "" }); setShowModal(true); }}
            className="px-8 py-3 bg-[var(--gold-primary)] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all duration-500 flex items-center gap-2"
          >
            <Plus size={14}/> Add New Dish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {menuItems.map(item => (
          <div key={item.id} className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-4 flex gap-6 hover:border-[var(--gold-primary)]/50 transition-all group">
            <div className="w-24 h-24 overflow-hidden shrink-0 bg-black/40 flex items-center justify-center">
              {item.image_url || item.imageUrl ? <img src={item.image_url || item.imageUrl} alt={item.catalogue_name || item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <UtensilsCrossed className="text-gray-800"/>}
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">{item.catalogue_name || item.name}</h4>
                <p className="text-[var(--gold-primary)] font-serif text-lg mt-1">₹{item.current_price !== undefined ? item.current_price : item.price}</p>
                <span className="text-[8px] uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5">{item.category_name || item.category}</span>
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
              <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Category Name</label>
                    <input value={formData.category_name} onChange={e => setFormData({...formData, category_name: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Subcategory Name</label>
                    <input value={formData.subcategory_name} onChange={e => setFormData({...formData, subcategory_name: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Catalogue ID</label>
                    <input value={formData.catalogue_id} onChange={e => setFormData({...formData, catalogue_id: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Catalogue Name</label>
                    <input value={formData.catalogue_name} onChange={e => setFormData({...formData, catalogue_name: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Variant ID</label>
                    <input value={formData.variant_id} onChange={e => setFormData({...formData, variant_id: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Variant Name</label>
                    <input value={formData.variant_name} onChange={e => setFormData({...formData, variant_name: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Current Price (₹)</label>
                    <input type="number" step="0.01" value={isNaN(formData.current_price) ? "" : formData.current_price} onChange={e => setFormData({...formData, current_price: e.target.value === "" ? 0 : parseFloat(e.target.value)})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Description</label>
                    <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-[var(--surface-border)] p-3 text-white text-xs focus:border-[var(--gold-primary)] outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Dish Image URL</label>
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
                      value={formData.image_url} 
                      onChange={e => setFormData({...formData, image_url: e.target.value})} 
                      placeholder="Or paste an image URL here..."
                      className="w-full bg-background border border-[var(--surface-border)] p-3 pr-10 text-white text-xs focus:border-[var(--gold-primary)] outline-none" 
                    />
                    {formData.image_url && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <Check size={14}/>
                      </div>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="w-full h-32 border border-[var(--surface-border)] bg-black/40 overflow-hidden">
                       <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain p-2"/>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-[var(--surface-border)] mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold hover:text-white">Cancel</button>
                  <button type="submit" className="px-10 py-3 bg-[var(--gold-primary)] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">Save Menu Item</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
