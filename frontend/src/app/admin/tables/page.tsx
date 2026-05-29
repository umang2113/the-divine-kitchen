"use client";

import { useState } from "react";
import { QrCode, Printer, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

export default function TableQRGenerator() {
  const [tableCount, setTableCount] = useState(5);
  const [baseUrl, setBaseUrl] = useState("");

  // Need to wait for mount to access window
  useState(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}/table`);
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--surface-border)] p-6 min-h-[80vh] rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-serif text-white uppercase tracking-widest flex items-center gap-2">
            <QrCode size={24} className="text-[var(--gold-primary)]" /> Smart Table QR Codes
          </h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Generate and print QR codes for Dine-in orders</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-black border border-[var(--surface-border)] rounded-full p-1">
            <button 
              onClick={() => setTableCount(Math.max(1, tableCount - 1))}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[var(--surface-border)] flex items-center justify-center text-white transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="w-16 text-center text-xs uppercase tracking-widest font-bold text-white">
              {tableCount} Tables
            </div>
            <button 
              onClick={() => setTableCount(tableCount + 1)}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[var(--surface-border)] flex items-center justify-center text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded hover:bg-white transition-colors"
          >
            <Printer size={16} /> Print Codes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 print:grid-cols-3 print:gap-4">
        {tables.map(table => (
          <motion.div 
            key={table}
            layout
            className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-4 border-black print:border-2"
          >
            <h3 className="text-black font-serif text-2xl font-bold uppercase tracking-widest mb-1">
              Table {table}
            </h3>
            <p className="text-gray-500 text-[8px] uppercase tracking-widest font-bold mb-6 text-center leading-tight">
              Scan to Order<br />The Divine Kitchen
            </p>
            
            <div className="p-2 border border-gray-200 rounded-lg">
              <QRCodeSVG 
                value={`${baseUrl}/${table}`}
                size={120}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
