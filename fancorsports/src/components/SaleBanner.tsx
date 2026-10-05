import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";

export function SaleBanner() {
  return (
    <div className="bg-[#03a9f4] py-2.5 overflow-hidden relative border-b border-white/10 shadow-md">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap items-center gap-10"
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 text-white font-anton text-xs md:text-sm uppercase tracking-[0.2em] select-none">
            <Zap className="w-4 h-4 fill-white text-yellow-300 animate-pulse" />
            <span>Flash Sale: 20% Off All Items</span>
            <Zap className="w-4 h-4 fill-white text-yellow-300 animate-pulse" />
            <span>Use Code: <strong className="bg-white/20 px-2 py-0.5 rounded text-yellow-300 font-mono text-xs">ICONZ20</strong></span>
            <Zap className="w-4 h-4 fill-white text-yellow-300 animate-pulse" />
            <span>Limited Time Only</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
