import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Flame, Users, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 overflow-y-auto backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-[#03060b] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-900 my-8"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-600 via-[#03a9f4] to-indigo-600" />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors z-10 bg-zinc-950 border border-zinc-900 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-12 overflow-y-auto max-h-[90vh]">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="inline-flex items-center gap-1.5 bg-[#03a9f4]/10 border border-[#03a9f4]/20 text-[#03a9f4] text-[10px] font-mono font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4">
                  OUR MISSION & CORE IDENTITY
                </span>
                <h2 className="font-anton text-4xl md:text-6xl text-white uppercase tracking-wider mb-4">
                  OUR STORY
                </h2>
                <div className="h-1 w-20 bg-[#03a9f4] mx-auto rounded-full" />
              </div>

              <div className="space-y-6 text-zinc-300 text-sm md:text-base leading-relaxed text-center max-w-3xl mx-auto select-text">
                <p>
                  FanCor Iconz was born out of a pure passion for the game. We believe that being a fan isn't just about watching the game—it's about living it. Our mission is to provide fans with high-quality, iconic apparel that represents their favorite sports leagues with style and pride.
                </p>
                
                <p>
                  From the gridiron to the hardwood, and the diamond to the court, we curate collections that celebrate the spirit of competition and the legends who inspire us. Every piece of merchandise is designed with the fan in mind, ensuring comfort, durability, and a look that stands out in the crowd.
                </p>
                
                <p>
                  Whether you're cheering from the stands or from your living room, FanCor Iconz is here to help you wear your passion. Join the Iconz family and represent your team like never before.
                </p>

                {/* Pathway Highlight box matching AboutPage specifications */}
                <div className="bg-[#03a9f4]/5 border border-[#03a9f4]/20 p-6 md:p-8 rounded-2xl text-left space-y-4 my-8 relative overflow-hidden shadow-xl shadow-black/40">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#03a9f4]/10 blur-2xl rounded-full pointer-events-none" />
                  
                  <h4 className="font-anton text-base md:text-lg text-[#03a9f4] uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#03a9f4]" /> The Path of Representation
                  </h4>
                  
                  <div className="font-mono font-black text-[10px] md:text-xs text-[#03a9f4] tracking-wider leading-relaxed">
                    FAN ➔ COMMUNITY ➔ CUSTOMER ➔ MEMBER ➔ AMBASSADOR
                  </div>
                  
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-medium">
                    We believe every true enthusiast moves along a journey of deep sport and community progression. Starting out as a loyal <strong>Fan</strong>, you connect with a larger <strong>Community</strong>, proudly purchase gear as a valued <strong>Customer</strong>, step up as a card-carrying <strong>Member</strong>, and ultimately lead the charge as a brand <strong>Ambassador</strong>. This progression represents the ultimate ideal of positive sportsmanship—where respect, pride, and active fandom elevate the sports culture we love.
                  </p>
                </div>
              </div>

              {/* Grid pillars matching AboutPage specifications */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 text-center">
                  <div className="w-12 h-12 bg-[#03a9f4]/10 text-[#03a9f4] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-anton text-2xl text-white mb-2 uppercase">Quality</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Premium materials designed to last through every single season.</p>
                </div>
                
                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 text-center">
                  <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="font-anton text-2xl text-white mb-2 uppercase">Passion</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Built by fans, for fans. We know exactly what the game means to you.</p>
                </div>

                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 text-center">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-anton text-2xl text-white mb-2 uppercase">Community</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Join a global network of sports enthusiasts representing the best.</p>
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-zinc-950 via-[#03a9f4] to-zinc-950"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
