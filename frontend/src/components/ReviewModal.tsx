"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  itemName: string;
}

export default function ReviewModal({ isOpen, onClose, menuItemId, itemName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ menuItemId, rating, comment })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        alert("Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[var(--surface-dark)] border border-[var(--surface-border)] rounded-xl p-6 w-full max-w-md relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="text-center py-8">
              <div className="text-[var(--gold-primary)] mb-4 text-5xl flex justify-center">✧</div>
              <h3 className="text-xl font-serif text-white mb-2">Thank You!</h3>
              <p className="text-gray-400 text-sm">Your feedback helps us perfect our craft.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-serif text-[var(--gold-primary)] uppercase tracking-widest">Rate Your Experience</h3>
                <p className="text-white font-bold mt-2">{itemName}</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      className={`${(hoverRating || rating) >= star ? 'text-[var(--gold-primary)] fill-[var(--gold-primary)]' : 'text-gray-600'} transition-colors duration-200`}
                    />
                  </button>
                ))}
              </div>

              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this dish... (Optional)"
                className="w-full bg-black/50 border border-[var(--surface-border)] rounded p-3 text-white text-sm focus:outline-none focus:border-[var(--gold-primary)] mb-6 min-h-[100px]"
              />

              <button 
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="w-full bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
