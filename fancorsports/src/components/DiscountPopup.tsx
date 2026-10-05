import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';

interface DiscountPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DiscountPopup({ isOpen: propIsOpen, onClose: propOnClose }: DiscountPopupProps) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Determine whether to use controlled state (prop) or uncontrolled state (local)
  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : localIsOpen;

  useEffect(() => {
    if (isControlled) return;
    // Only show if they haven't dismissed or completed it yet
    const hasSeen = localStorage.getItem('hasSeenDiscountPopup');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setLocalIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isControlled]);

  const handleClose = () => {
    if (isControlled) {
      if (propOnClose) propOnClose();
    } else {
      setLocalIsOpen(false);
    }
    localStorage.setItem('hasSeenDiscountPopup', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      if (db) {
        try {
          await addDoc(collection(db, 'subscribers'), {
            email,
            source: 'discount_popup',
            subscribedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error saving subscriber to Firestore:", error);
          handleFirestoreError(error, OperationType.WRITE, 'subscribers');
        }
      } else {
        // Sandbox fallback
        const saved = JSON.parse(localStorage.getItem('sandbox_subscribers') || '[]');
        saved.push({ email, source: 'discount_popup', subscribedAt: new Date().toISOString() });
        localStorage.setItem('sandbox_subscribers', JSON.stringify(saved));
      }

      // Automatically close after showing the promo code for a few seconds
      setTimeout(() => {
        handleClose();
      }, 5000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-black/10"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-black/40 hover:text-black transition-colors z-10 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Logo variant="light" />
              </div>

              {!isSubmitted ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#03a9f4]/10 text-[#03a9f4] rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3 h-3" />
                    Special Offer
                  </div>
                  
                  <h2 className="font-anton text-4xl text-black uppercase leading-tight mb-2">
                    Get 20% OFF
                  </h2>
                  <p className="text-[#03a9f4] font-medium mb-8">
                    Join the Iconz family and get a discount on your first order. Be the first to know about new drops!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#03a9f4]" />
                      <input 
                        type="email" 
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#03a9f4]/5 border border-[#03a9f4]/30 rounded-xl focus:outline-none focus:border-[#03a9f4] transition-colors text-[#03a9f4] placeholder:text-[#03a9f4]/70 font-medium text-center sm:text-left"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-[#03a9f4] text-white font-bold rounded-xl hover:bg-[#03bbf4] hover:shadow-[#03a9f4]/30 transition-all uppercase tracking-widest shadow-lg shadow-[#03a9f4]/20 cursor-pointer"
                    >
                      Unlock Discount
                    </button>
                  </form>
                  
                  <p className="mt-6 text-[10px] text-black/40 uppercase tracking-widest">
                    * Valid for new customers only.
                  </p>
                </>
              ) : (
                <div className="py-12">
                  <div className="w-20 h-20 bg-[#03a9f4]/10 text-[#03a9f4] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 animate-bounce" />
                  </div>
                  <h2 className="font-anton text-3xl text-black uppercase mb-2">Welcome to the Family!</h2>
                  <p className="text-black/60 mb-6 font-semibold">Your 20% discount code is:</p>
                  <div className="bg-[#03a9f4] text-white font-anton text-4xl py-4 px-8 rounded-2xl tracking-widest selection:bg-white selection:text-[#03a9f4] shadow-md shadow-[#03a9f4]/30">
                    ICONZ20
                  </div>
                  <p className="mt-4 text-xs text-black/40 uppercase tracking-widest">Copy this code and use it at checkout</p>
                </div>
              )}
            </div>

            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-[#0f2d4a] via-[#03a9f4] to-[#0f2d4a]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
