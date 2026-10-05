import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Sparkles, Send } from "lucide-react";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 overflow-y-auto backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-[#03060b] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-900 my-8"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-600 via-[#03a9f4] to-indigo-600" />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors z-10 bg-zinc-950 border border-zinc-900 rounded-full cursor-pointer"
              aria-label="Close contact modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-12">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="inline-flex items-center gap-1.5 bg-[#03a9f4]/10 border border-[#03a9f4]/20 text-[#03a9f4] text-[10px] font-mono font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  SUPPORT & INQUIRIES
                </span>
                <h2 className="font-anton text-4xl md:text-5xl text-white uppercase tracking-wider mb-2">
                  Get In Touch
                </h2>
                <div className="h-1 w-16 bg-[#03a9f4] mx-auto rounded-full mb-4" />
                <p className="text-zinc-400 text-xs md:text-sm font-medium">
                  Have questions about FanCor Iconz official merch or your order? Send us a message and we&apos;ll get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <div className="max-w-md mx-auto p-10 bg-zinc-950/50 rounded-2xl border border-[#03a9f4]/20 text-center animate-fade-in">
                  <span className="text-5xl block mb-4">🏆</span>
                  <h3 className="font-anton text-2xl uppercase text-[#03a9f4] mb-2">Message Sent!</h3>
                  <p className="text-zinc-400 text-sm font-medium">Thank you for hitting us up. Our merch experts will get back to you shortly.</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-black">YOUR NAME</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#03a9f4] focus:bg-zinc-900 transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-black">YOUR EMAIL</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#03a9f4] focus:bg-zinc-900 transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-black">YOUR MESSAGE</label>
                    <textarea 
                      placeholder="How can we help you today?" 
                      rows={4}
                      className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#03a9f4] focus:bg-zinc-900 transition-all text-sm"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full mt-2 p-4 bg-[#03a9f4] hover:bg-blue-500 text-black hover:text-white font-extrabold cursor-pointer rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-zinc-950 via-[#03a9f4] to-zinc-950"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
