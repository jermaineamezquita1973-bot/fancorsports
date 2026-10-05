import React, { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Sparkles, Tag, Percent, ArrowRight } from "lucide-react";

interface DiscountCardProps {
  onShowToast: (message: string) => void;
  onOpenCart?: () => void;
}

export function DiscountCard({ onShowToast, onOpenCart }: DiscountCardProps) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(() => localStorage.getItem("active_promo") === "ICONZ20");

  const promoCode = "ICONZ20";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      onShowToast("⚡ Coupon Code ICONZ20 copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleApply = () => {
    localStorage.setItem("active_promo", promoCode);
    setApplied(true);
    onShowToast("🎉 20% discount applied instantly to your cart!");
    
    if (onOpenCart) {
      setTimeout(() => {
        onOpenCart();
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="relative group overflow-hidden bg-zinc-950 rounded-3xl border border-zinc-900 hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
        
        {/* Subtle decorative mesh background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-cyan-950/10 to-indigo-950/20 opacity-60 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Real-world ticket notches/cutouts for style */}
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full bg-black border-r border-zinc-900 z-10" />
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full bg-black border-l border-zinc-900 z-10" />

        {/* Content Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center">
          
          {/* Left section: Massive discount highlight */}
          <div className="md:col-span-4 p-8 text-center md:text-left border-b md:border-b-0 md:border-r border-dashed border-zinc-900 flex flex-col justify-center items-center md:items-start space-y-2">
            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-[#00D2FF] text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-md mb-2">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              OFFICIAL OFFER
            </span>
            
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="font-anton text-7xl md:text-8xl text-white tracking-tighter leading-none select-none">
                20%
              </span>
              <span className="font-anton text-4xl text-[#00D2FF] tracking-tighter uppercase leading-none select-none">
                OFF
              </span>
            </div>
            
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-center md:text-left">
              All Sports &amp; Fan apparel
            </p>
          </div>

          {/* Middle section: Details & Promo Info */}
          <div className="md:col-span-5 p-8 flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Tag className="w-4 h-4 text-blue-400" />
                <h3 className="text-white text-lg font-black tracking-wider uppercase">
                  FANCOR ICONZ VIP PASS
                </h3>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Unlock instant savings across our entire printify apparel lineup, including retro hoodies, custom jerseys, and authentic accessories. Valid for all MLS, NFL, NBA, WNBA, and NHL fans.
              </p>
            </div>

            {/* Fake barcode block for visual authenticity */}
            <div className="flex flex-col space-y-1.5">
              <div className="h-6 flex items-end gap-[2px] opacity-40 group-hover:opacity-60 transition-opacity">
                {[1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 4, 2, 1, 3, 1, 2, 3, 4, 1, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, idx) => (
                  <div key={idx} className="bg-white h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                <span>FC-ICONZ-2026-ACTIVE</span>
                <span>LIMITED SUPPORTERS PASS</span>
              </div>
            </div>
          </div>

          {/* Right section: Interactive code copy & apply buttons */}
          <div className="md:col-span-3 p-8 bg-zinc-900/20 flex flex-col justify-center gap-3.5 h-full border-t md:border-t-0 border-zinc-900 md:rounded-r-3xl">
            
            {/* Promo display block */}
            <div 
              onClick={handleCopy}
              className="group/code bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-95 shadow-inner"
              title="Click to copy coupon code"
            >
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Coupon Code</span>
                <span className="font-mono text-base font-black text-white tracking-widest">{promoCode}</span>
              </div>
              <div className="bg-zinc-900 group-hover/code:bg-blue-600/10 p-2 rounded-lg text-zinc-400 group-hover/code:text-blue-400 transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400 animate-pulse" /> : <Copy className="w-4 h-4" />}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                applied
                  ? "bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:scale-[1.02]"
              }`}
            >
              {applied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  DISCOUNT APPLIED!
                </>
              ) : (
                <>
                  APPLY INSTANTLY
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
