import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isSubmitted) {
      setLoading(true);
      if (db) {
        try {
          await addDoc(collection(db, 'subscribers'), {
            email,
            source: 'homepage_cta',
            subscribedAt: serverTimestamp(),
          });
          setIsSubmitted(true);
        } catch (error) {
          console.error("Error saving subscriber to Firestore:", error);
          handleFirestoreError(error, OperationType.WRITE, 'subscribers');
        } finally {
          setLoading(false);
        }
      } else {
        // Sandbox fallback
        const saved = JSON.parse(localStorage.getItem('sandbox_subscribers') || '[]');
        saved.push({ email, source: 'homepage_cta', subscribedAt: new Date().toISOString() });
        localStorage.setItem('sandbox_subscribers', JSON.stringify(saved));
        setIsSubmitted(true);
        setLoading(false);
      }
    }
  };

  return (
    <section className="py-24 px-[5%] bg-gradient-to-br from-[#03060b] via-[#050f1a] to-[#020508] border-t border-b border-zinc-900/60 relative overflow-hidden">
      {/* Background Graphic Grid/Accent lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(3,169,244,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D2FF]/20 to-transparent" />

      <div className="max-w-[800px] mx-auto text-center relative z-10 space-y-6">
        <div className="w-16 h-16 bg-[#03a9f4]/10 border border-[#03a9f4]/25 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black">
          <Mail className="w-8 h-8 text-[#03a9f4]" />
        </div>

        <span className="inline-flex items-center gap-1.5 bg-[#03a9f4]/10 border border-[#03a9f4]/20 text-[#03a9f4] text-[10px] font-mono font-black tracking-[0.2em] uppercase px-4 py-1 rounded-full">
          <Sparkles className="w-3 h-3 animate-spin" />
          JOIN THE FANCOR FAMILY
        </span>

        <h2 className="font-anton text-4xl md:text-6xl text-white uppercase tracking-wider">
          Join The <span className="text-[#03a9f4]">FanCor Iconz</span> Family
        </h2>
        
        <p className="text-sm md:text-lg text-zinc-400 max-w-xl mx-auto font-medium">
          Subscribe to get exclusive access to new drops, limited edition gear, and special insider discounts before anyone else.
        </p>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3.5 max-w-[550px] mx-auto pt-4">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address" 
              className="flex-1 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 text-white placeholder:text-zinc-600 px-6 py-4 rounded-xl focus:outline-none focus:border-[#03a9f4] text-sm md:text-base font-medium transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#03a9f4] hover:bg-[#03bbf4] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#03a9f4]/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Subscribe'} 
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="bg-[#03a9f4]/10 border border-[#03a9f4]/25 text-[#03a9f4] p-8 rounded-2xl max-w-[480px] mx-auto backdrop-blur-md space-y-3 shadow-2xl animate-fade-in">
            <h3 className="font-anton text-2xl uppercase mb-1 text-white tracking-wider">You're In!</h3>
            <p className="text-zinc-300 text-xs md:text-sm font-semibold uppercase tracking-wider">Use this code for 20% off your first order:</p>
            <div className="bg-zinc-950 text-[#03a9f4] font-anton text-3xl md:text-4xl py-3 px-6 rounded-xl tracking-widest border border-[#03a9f4]/30 shadow-md">
              ICONZ20
            </div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Enter this code at checkout</p>
          </div>
        )}
      </div>
    </section>
  );
}
