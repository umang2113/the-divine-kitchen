"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

export default function TableLandingPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tableId = params.tableId as string;
    
    if (tableId) {
      // Save Dine-in context in local storage
      localStorage.setItem("dineInTable", tableId);
      
      // Simulate a small loading delay for a premium feel
      setTimeout(() => {
        router.push("/menu");
      }, 1500);
    } else {
      router.push("/");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[var(--gold-primary)]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <UtensilsCrossed size={32} className="text-[var(--gold-primary)]" />
      </div>
      <h1 className="text-2xl md:text-3xl font-serif text-white uppercase tracking-widest mb-4">
        Welcome to <span className="text-gradient-gold">Table {params.tableId}</span>
      </h1>
      <p className="text-gray-400 text-sm uppercase tracking-widest mb-8">
        Preparing your digital menu...
      </p>
      <div className="w-48 h-1 bg-[var(--surface-dark)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--gold-primary)] animate-[loading_1.5s_ease-in-out_forwards]" />
      </div>
    </div>
  );
}
