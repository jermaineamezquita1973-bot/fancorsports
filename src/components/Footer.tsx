import React, { useState } from 'react';
import { 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  X, 
  ShieldCheck, 
  Scale, 
  Accessibility, 
  HelpCircle, 
  Truck, 
  Ruler 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ALL_LEAGUES = [
  { name: 'NFL', hash: '#catalog' },
  { name: 'NBA', hash: '#catalog' },
  { name: 'WNBA', hash: '#catalog' },
  { name: 'MLB', hash: '#catalog' },
  { name: 'NHL', hash: '#catalog' },
];

interface FooterProps {
  onAboutOpen: () => void;
  onChatOpen: () => void;
  onScrollToCatalog?: () => void;
  onSelectLeague?: (league: string) => void;
  onContactOpen?: () => void;
}

export function Footer({ 
  onAboutOpen, 
  onChatOpen, 
  onScrollToCatalog, 
  onSelectLeague, 
  onContactOpen 
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for active help/policy modal tab
  const [activeModalTab, setActiveModalTab] = useState<'privacy' | 'terms' | 'accessibility' | 'faq' | 'shipping' | 'sizeguide' | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isSubmitted) {
      setLoading(true);
      if (db) {
        try {
          await addDoc(collection(db, 'subscribers'), {
            email,
            source: 'footer_newsletter',
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
        saved.push({ email, source: 'footer_newsletter', subscribedAt: new Date().toISOString() });
        localStorage.setItem('sandbox_subscribers', JSON.stringify(saved));
        setIsSubmitted(true);
        setLoading(false);
      }
    }
  };

  return (
    <footer className="bg-[#03060b] text-white py-20 px-[5%] border-t border-zinc-900/60 relative overflow-hidden select-text">
      {/* Visual top border styling accent */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00D2FF]/20 to-transparent" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="font-anton text-3xl uppercase tracking-wider text-[#4fc3f7] drop-shadow-[0_0_12px_rgba(79,195,247,0.15)]">
              FanCor Iconz
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Your premier destination for iconic sports merchandise. Represent your favorite teams with style, pride, and positive sportsmanship.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded-xl hover:bg-[#4fc3f7]/15 hover:text-[#4fc3f7] hover:border-[#4fc3f7]/30 transition-all shadow-md cursor-pointer" title="Follow us on Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded-xl hover:bg-[#4fc3f7]/15 hover:text-[#4fc3f7] hover:border-[#4fc3f7]/30 transition-all shadow-md cursor-pointer" title="Follow us on Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded-xl hover:bg-[#4fc3f7]/15 hover:text-[#4fc3f7] hover:border-[#4fc3f7]/30 transition-all shadow-md cursor-pointer" title="Follow us on Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded-xl hover:bg-[#4fc3f7]/15 hover:text-[#4fc3f7] hover:border-[#4fc3f7]/30 transition-all shadow-md cursor-pointer" title="Subscribe to our YouTube Channel">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div>
          <h4 className="font-anton text-lg uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2.5 text-zinc-100">Shop</h4>
          <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400 font-semibold">
            {ALL_LEAGUES.map((league) => (
               <li key={league.name}>
                 <a 
                   href={league.hash} 
                   onClick={(e) => {
                     e.preventDefault();
                     if (onSelectLeague) {
                       onSelectLeague(league.name);
                     }
                     if (onScrollToCatalog) {
                       onScrollToCatalog();
                     }
                   }}
                   className="hover:text-[#4fc3f7] transition-colors cursor-pointer"
                 >
                   {league.name} Collection
                 </a>
               </li>
            ))}
            <li>
              <a 
                href="#catalog" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectLeague) {
                    onSelectLeague("ALL");
                  }
                  if (onScrollToCatalog) {
                    onScrollToCatalog();
                  }
                }}
                className="hover:text-[#4fc3f7] transition-colors cursor-pointer"
              >
                Premium Apparel
              </a>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 className="font-anton text-lg uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2.5 text-zinc-100">Support</h4>
          <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400 font-semibold">
            <li>
              <button onClick={onAboutOpen} className="hover:text-[#4fc3f7] transition-colors text-left bg-transparent border-none p-0 cursor-pointer">
                Our Story
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  if (onContactOpen) {
                    onContactOpen();
                  } else {
                    onChatOpen();
                  }
                }} 
                className="hover:text-[#4fc3f7] transition-colors text-left bg-transparent border-none p-0 cursor-pointer"
              >
                Contact Us
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModalTab('faq')} className="hover:text-[#4fc3f7] transition-colors text-left bg-transparent border-none p-0 cursor-pointer">
                FAQ
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModalTab('shipping')} className="hover:text-[#4fc3f7] transition-colors text-left bg-transparent border-none p-0 cursor-pointer">
                Shipping & Returns
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModalTab('sizeguide')} className="hover:text-[#4fc3f7] transition-colors text-left bg-transparent border-none p-0 cursor-pointer">
                Size Guide
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Column / Newsletter */}
        <div>
          <h4 className="font-anton text-lg uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2.5 text-zinc-100">Newsletter</h4>
          <p className="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed font-semibold">
            Subscribe to get special offers and first look at brand new drops.
          </p>
          {!isSubmitted ? (
            <form onSubmit={handleSubscribe} className="flex gap-2.5">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Your email" 
                className="bg-zinc-950/80 border border-zinc-900 rounded-xl px-4 py-3 text-xs sm:text-sm w-full text-white placeholder-zinc-650 focus:outline-none focus:border-[#4fc3f7] font-medium"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-[#4fc3f7] text-[#0f2d4a] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#03bbf4] hover:text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? '...' : 'Join'}
              </button>
            </form>
          ) : (
            <div className="bg-[#4fc3f7]/10 border border-[#4fc3f7]/25 text-[#4fc3f7] px-4.5 py-4.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-md shadow-black/40">
              <Mail className="w-4.5 h-4.5" />
              Thanks for subscribing! Use code <span className="underline">ICONZ20</span>.
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-zinc-900/60 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} FanCor Iconz. All Rights Reserved.</p>
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveModalTab('privacy')} 
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-zinc-500 font-bold uppercase tracking-widest"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setActiveModalTab('terms')} 
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-zinc-500 font-bold uppercase tracking-widest"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => setActiveModalTab('accessibility')} 
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-zinc-500 font-bold uppercase tracking-widest"
          >
            Accessibility
          </button>
        </div>
      </div>

      {/* Policy and Info Modal Overlay */}
      <AnimatePresence>
        {activeModalTab && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-950 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-900 flex flex-col max-h-[85vh]"
            >
              {/* Decorative top strip */}
              <div className="h-[3px] bg-gradient-to-r from-blue-500 via-[#00D2FF] to-indigo-500" />
              
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00D2FF]/10 text-[#00D2FF] rounded-xl border border-[#00D2FF]/20">
                    {activeModalTab === 'privacy' && <ShieldCheck className="w-5 h-5" />}
                    {activeModalTab === 'terms' && <Scale className="w-5 h-5" />}
                    {activeModalTab === 'accessibility' && <Accessibility className="w-5 h-5" />}
                    {activeModalTab === 'faq' && <HelpCircle className="w-5 h-5" />}
                    {activeModalTab === 'shipping' && <Truck className="w-5 h-5" />}
                    {activeModalTab === 'sizeguide' && <Ruler className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#00D2FF] uppercase">
                      {activeModalTab === 'privacy' || activeModalTab === 'terms' || activeModalTab === 'accessibility' ? 'LEGAL POLICY' : 'CUSTOMER GUIDE'}
                    </span>
                    <h3 className="text-white text-lg font-black tracking-wider uppercase font-anton">
                      {activeModalTab === 'privacy' && 'Privacy Policy'}
                      {activeModalTab === 'terms' && 'Terms of Service'}
                      {activeModalTab === 'accessibility' && 'Accessibility'}
                      {activeModalTab === 'faq' && 'Frequently Asked Questions'}
                      {activeModalTab === 'shipping' && 'Shipping & Returns'}
                      {activeModalTab === 'sizeguide' && 'Size Guide'}
                    </h3>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveModalTab(null)}
                  className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar text-zinc-300 text-sm space-y-5 leading-relaxed font-semibold">
                {activeModalTab === 'privacy' && (
                  <>
                    <div className="p-4 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-2xl flex gap-3.5 items-start">
                      <ShieldCheck className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-450">
                        Your privacy is our utmost priority. We operate a highly transparent, fully-vetted sports commerce portal ensuring fan-data security.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">1. Information We Collect</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        We collect essential information to process orders and improve your shopping experience. This includes personal identifiers (such as name, email, shipping address, and billing address) and standard cookies to tailor recommended supporter gear on your visits.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">2. How We Secure Your Data</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        All transaction data is encrypted using Secure Socket Layer (SSL) protocols. API connections—including Printify on-demand product synchronization—remain fully proxied via our backend systems. We never distribute, sell, or rent your database records to outside marketing agencies.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">3. Supporter Communication</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        By joining our FanCor Iconz newsletter or opting in during checkouts, you permit us to send updates regarding seasonal drops, league playoff promotional discounts, and custom order statuses. You can unsubscribe immediately using the link inside any email or contact support.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">4. Sandbox Mode Policies</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        If the website is operating in configuration sandbox fallback mode, all simulation subscribers, orders, and products are stored securely inside your local browser cache (localStorage) and never transmitted to external databases.
                      </p>
                    </div>
                  </>
                )}

                {activeModalTab === 'terms' && (
                  <>
                    <div className="p-4 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-2xl flex gap-3.5 items-start">
                      <Scale className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-450">
                        These terms establish a mutual agreement between supporters and FanCor Iconz. By browsing our collections, you agree to these operating standards.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">1. Apparel Production & Custom Orders</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        FanCor Iconz integrates premium print-on-demand networks to create customized supporter hoodies, athletic jerseys, and sports accessories. Manufacturing timelines depend on order volume and the active team season, with production usually finalizing within 2-4 business days.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">2. Intellectual Property & Fan Conduct</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        All visual motifs, retro icons, and custom layout combinations on our catalog are protected. Supporters are strictly prohibited from copying, distributing, or scraping catalog materials for unauthorized commercial resale.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">3. Purchase Terms & Defect Returns</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Prices are displayed in USD. While we strive to display absolute photo-realistic previews of apparel color gradients, actual garments may experience microscopic print variance. We honor a complete free reprint policy for shipping errors or fabric quality issues.
                      </p>
                    </div>
                  </>
                )}

                {activeModalTab === 'accessibility' && (
                  <>
                    <div className="p-4 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-2xl flex gap-3.5 items-start">
                      <Accessibility className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-450">
                        We believe sports fandom is universal. We are committed to making our gear, catalog, and digital interface fully accessible to every fan.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">1. Accessible Design Standards</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Our store interface actively matches Web Content Accessibility Guidelines (WCAG 2.1) Level AA requirements. This includes optimizing font hierarchies, maintaining a high-contrast dark visual color schema, and securing robust keyboard-focused navigation support.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">2. Implemented Capabilities</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        - **Keyboard Tabbing**: Seamless movement through catalog drawers, sliders, and checkout forms without a cursor.<br/>
                        - **Alt Text Tags**: Rich descriptive tags for all product graphics and image arrays.<br/>
                        - **Aria-Labels**: Comprehensive contextual labels for functional triggers and buttons to aid assistive readers.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">3. Support & Accessibility Feedback</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        We constantly monitor accessibility performance. If you experience difficulty accessing any part of our website, please email us directly at <span className="text-white">accessibility@fancor-iconz.com</span>. We guarantee an active human response and remediation schedule within 48 hours.
                      </p>
                    </div>
                  </>
                )}

                {activeModalTab === 'faq' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-1.5">
                      <h5 className="text-white text-xs font-black tracking-wider uppercase text-[#00D2FF]">Q: How long does production and dispatch take?</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Because our customized retro jerseys and team hoodies are crafted dynamically to reduce wasteful overproduction, garments require 2-4 business days for printing and assembly before courier carrier handoff.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-1.5">
                      <h5 className="text-white text-xs font-black tracking-wider uppercase text-[#00D2FF]">Q: Can I apply multiple promotion coupons?</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Supporters can apply one major discount coupon code per digital checkout. Our standard welcome drop discount code is <span className="text-white font-bold">ICONZ20</span> for 20% off apparel!
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-1.5">
                      <h5 className="text-white text-xs font-black tracking-wider uppercase text-[#00D2FF]">Q: Do you offer bulk order rates for fan groups or leagues?</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Absolutely! If you represent a recreational club, supporters branch, or athletic league looking for custom team kits, please open our chat or use the Contact Form to receive wholesale pricing structures.
                      </p>
                    </div>
                  </div>
                )}

                {activeModalTab === 'shipping' && (
                  <>
                    <div className="p-4 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-2xl flex gap-3.5 items-start">
                      <Truck className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-450">
                        Fast and reliable. All merchandise items are dispatched with end-to-end active tracking links so you can follow your gear's journey.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">Shipping Options & Costs</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        - **Standard Fan Shipping**: Free on orders over $75, or a flat $4.99 rate (takes 5-8 business days).<br/>
                        - **Express Playoff Shipping**: $12.99 priority carrier rate (takes 2-4 business days post-printing).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-xs font-black tracking-wider uppercase text-[#4fc3f7]">Our Hassle-Free Returns</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        We offer a complete 30-day return window. If your apparel features print misalignments, manufacturing flaws, or fabric damage, we will ship a replacement print free of charge without requiring you to mail back the damaged item.
                      </p>
                    </div>
                  </>
                )}

                {activeModalTab === 'sizeguide' && (
                  <>
                    <div className="p-4 bg-[#00D2FF]/5 border border-[#00D2FF]/10 rounded-2xl flex gap-3.5 items-start">
                      <Ruler className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-450">
                        Ensure the perfect fit for your game-day outfits. All our shirts and jackets are crafted with premium athletic fits.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 text-white font-bold uppercase tracking-widest text-[10px]">
                            <th className="py-2.5">Size</th>
                            <th className="py-2.5 font-mono">Chest (in)</th>
                            <th className="py-2.5 font-mono">Length (in)</th>
                            <th className="py-2.5">Fit Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 font-mono text-[11px]">
                          <tr>
                            <td className="py-2.5 text-white font-bold">S</td>
                            <td className="py-2.5">34" - 36"</td>
                            <td className="py-2.5">28"</td>
                            <td className="py-2.5 font-sans font-medium">Slim athletic fit</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 text-white font-bold">M</td>
                            <td className="py-2.5">38" - 40"</td>
                            <td className="py-2.5">29"</td>
                            <td className="py-2.5 font-sans font-medium">True standard unisex fit</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 text-white font-bold">L</td>
                            <td className="py-2.5">42" - 44"</td>
                            <td className="py-2.5">30"</td>
                            <td className="py-2.5 font-sans font-medium">Comfortable loose fit</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 text-white font-bold">XL</td>
                            <td className="py-2.5">46" - 48"</td>
                            <td className="py-2.5">31"</td>
                            <td className="py-2.5 font-sans font-medium">Streetwear relaxed style</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 text-white font-bold">2XL</td>
                            <td className="py-2.5">50" - 52"</td>
                            <td className="py-2.5">32"</td>
                            <td className="py-2.5 font-sans font-medium">Oversized layered comfort</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-zinc-900 bg-black/40 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  FANCOR ICONZ &copy; {new Date().getFullYear()}
                </span>
                <button
                  onClick={() => setActiveModalTab(null)}
                  className="bg-[#00D2FF] hover:bg-[#00D2FF]/90 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
