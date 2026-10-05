import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Sparkles, 
  Filter, 
  ChevronUp, 
  ChevronDown,
  ShoppingBag, 
  ShieldCheck, 
  Heart,
  HelpCircle,
  Truck,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Award,
  X
} from "lucide-react";

import { SaleBanner } from "./components/SaleBanner";
import { ContactForm } from "./components/ContactForm";
import { ChatAgent } from "./components/ChatAgent";
import Navbar, { LEAGUE_DROP_DATA } from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import ChatDrawer from "./components/ChatDrawer";
import { FanStand } from "./components/FanStand";
import { ProductGrid } from "./components/ProductGrid";
import AdminLoginModal from "./components/AdminLoginModal";
import AdminDashboardView from "./components/AdminDashboardView";
import TeamSelectionGrid from "./components/TeamSelectionGrid";
import { NewsletterCTA } from "./components/NewsletterCTA";
import { AboutModal } from "./components/AboutModal";
import { DiscountPopup } from "./components/DiscountPopup";
import { DiscountCard } from "./components/DiscountCard";
import { SportsCinematicSlide } from "./components/SportsCinematicSlide";
import { HeroImageSlider } from "./components/HeroImageSlider";
import { Footer } from "./components/Footer";
import { CollectionReviews } from "./components/CollectionReviews";
import { auth, isFirebaseConfigured } from "./lib/firebase";

import { MASTER_TEAMS_LIST } from "./printifyCatalog";
import { CartItem, Product } from "./types";

export default function App() {
  // Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("fancor_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Admin Login modal state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // About Modal state
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Contact Modal state
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Fan Stand Modal state
  const [isFanStandOpen, setIsFanStandOpen] = useState(false);

  // Discount Modal state (Controlled from App)
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);

  // Admin login user state & View control
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"storefront" | "admin">("storefront");

  // Filter state
  const [activeLeague, setActiveLeague] = useState<string>("ALL");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [syncSlideIndex, setSyncSlideIndex] = useState(0);

  // Notifications (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Total item count in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Trigger temporary notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add item to cart
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Updated quantity of ${product.name} in your cart!`);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      showToast(`Added ${product.name} to your cart!`);
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItem = (productId: string) => {
    const item = cartItems.find((i) => i.product.id === productId);
    if (item) {
      showToast(`Removed ${item.product.name} from your cart.`);
    }
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Auto trigger ICONZ20 coupon applied
  const handleApplyPromo = () => {
    showToast("⚡ Promo Code ICONZ20 is ready for checkout!");
  };

  // Click on a league button in Hero or filter area
  const handleSelectLeague = (league: string) => {
    setActiveLeague(league);
    setActiveTeam(null);
    setActiveKeyword(null);
  };

  const handleScrollToCatalog = () => {
    const targetId = activeTeam !== null || activeKeyword !== null ? "shop-by-collection" : "team-selection-grid";
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Automatically scroll to catalog when any filter/collection is selected
  useEffect(() => {
    if (activeLeague !== "ALL" || activeTeam !== null || activeKeyword !== null) {
      const timer = setTimeout(() => {
        const targetId = activeTeam !== null || activeKeyword !== null ? "shop-by-collection" : "team-selection-grid";
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeLeague, activeTeam, activeKeyword]);

  // Auto trigger discount popup on first-time visit
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenDiscountPopup");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsDiscountOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for the custom "add-to-cart" event from ProductGrid
  useEffect(() => {
    const handleAddEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleAddToCart(customEvent.detail);
      }
    };
    window.addEventListener("add-to-cart", handleAddEvent);
    return () => window.removeEventListener("add-to-cart", handleAddEvent);
  }, []);

  // Sync cartItems changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("fancor_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cartItems]);

  // Handle Stripe redirect URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout_status");
    if (checkoutStatus === "success") {
      setCartItems([]);
      try {
        localStorage.removeItem("fancor_cart");
      } catch {}
      
      // Open cart drawer to trigger success state
      setTimeout(() => {
        setIsCartOpen(true);
        showToast("🎉 Payment success! Thank you for your support!");
      }, 500);
    } else if (checkoutStatus === "cancel") {
      // Clean query params
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
      showToast("ℹ️ Stripe checkout cancelled. Your items are safe in your cart.");
    }
  }, []);

  // Sync adminUser auth state
  useEffect(() => {
    const checkAdminAuth = () => {
      if (isFirebaseConfigured && auth) {
        const user = auth.currentUser;
        if (user && user.email === "jermaineamezquita1973@gmail.com") {
          setAdminUser(user.email);
        } else {
          setAdminUser(null);
        }
      } else {
        const savedAdmin = localStorage.getItem("sandbox_admin_user");
        if (savedAdmin === "jermaineamezquita1973@gmail.com") {
          setAdminUser(savedAdmin);
        } else {
          setAdminUser(null);
        }
      }
    };

    checkAdminAuth();

    window.addEventListener("admin-auth-changed", checkAdminAuth);
    
    let unsubscribe: any = null;
    if (isFirebaseConfigured && auth) {
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user?.email === "jermaineamezquita1973@gmail.com") {
            setAdminUser(user.email);
          } else {
            setAdminUser(null);
          }
        });
      });
    }

    return () => {
      window.removeEventListener("admin-auth-changed", checkAdminAuth);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const categories = ["ALL", "Jerseys", "Hoodies", "T-Shirts", "Accessories"];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white relative">
      
      {/* 1. TOP FLASH SALE BAR */}
      <SaleBanner />

      {/* 2. STICKY BRAND HEADER & NAVIGATION */}
      <Navbar
        cartCount={cartCount}
        activeLeague={activeLeague}
        setActiveLeague={(league) => {
          setActiveLeague(league);
          setActiveTeam(null);
          setActiveKeyword(null);
        }}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setActiveKeyword(null);
        }}
        activeTeam={activeTeam}
        setActiveTeam={(team) => {
          setActiveTeam(team);
          if (team) {
            // Auto detect league for selected team
            const foundTeam = MASTER_TEAMS_LIST.find(t => t.team.toLowerCase() === team.toLowerCase());
            if (foundTeam) {
              setActiveLeague(foundTeam.league);
            }
          }
        }}
        activeKeyword={activeKeyword}
        setActiveKeyword={setActiveKeyword}
        onCartOpen={() => setIsCartOpen(true)}
        onChatOpen={() => setIsChatOpen(true)}
        onLoginOpen={() => setIsAdminLoginOpen(true)}
        onAboutOpen={() => setIsAboutOpen(true)}
        onContactOpen={() => setIsContactOpen(true)}
        onFanStandOpen={() => setIsFanStandOpen(true)}
        adminEmail={adminUser}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === "admin") {
            setIsCartOpen(false);
            setIsChatOpen(false);
          }
        }}
      />

      {currentView === "admin" && adminUser ? (
        <AdminDashboardView 
          adminEmail={adminUser} 
          onExit={() => setCurrentView("storefront")} 
        />
      ) : (
        <>
          {/* 3. HERO SIX-IMAGE SLIDER SECTION */}
          <section className="relative w-full select-none">
            <HeroImageSlider
              activeLeague={activeLeague}
              activeTeam={activeTeam}
              onSelectLeague={handleSelectLeague}
              onSelectTeam={(lg, teamName) => {
                setActiveLeague(lg);
                setActiveCategory("ALL");
                setActiveTeam(teamName);
                setActiveKeyword(null);
              }}
              onShopAll={() => handleSelectLeague("ALL")}
              onOpenDiscount={() => setIsDiscountOpen(true)}
              currentIndex={syncSlideIndex}
              onIndexChange={setSyncSlideIndex}
            />
          </section>

          {/* DYNAMIC DISCOUNT PROMOTIONAL VOUCHER CARD */}
          {activeLeague === "ALL" && activeTeam === null && activeKeyword === null && (
            <section className="w-full bg-black py-4">
              <DiscountCard 
                onShowToast={showToast} 
                onOpenCart={() => setIsCartOpen(true)}
              />
            </section>
          )}

      {/* 4. SHOWROOM & PRODUCT CATALOG CONTAINER */}
      {activeLeague !== "ALL" && activeTeam === null && activeKeyword === null && (
        <section id="team-selection-grid" className="scroll-mt-24 mb-6">
          <TeamSelectionGrid
            league={activeLeague}
            onSelectTeam={(team) => {
              setActiveTeam(team);
              setTimeout(() => {
                const element = document.getElementById("shop-by-collection");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
          />
        </section>
      )}

      {(activeLeague === "ALL" || activeTeam !== null || activeKeyword !== null) && (
        <section id="shop-by-collection" className="bg-zinc-950 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 scroll-mt-24 pt-10">
          
          {/* Active Collection Header Banner */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-6 pb-2 text-center">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-[#00D2FF] text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
              NOW BROWSING
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest">
              {activeTeam ? activeTeam : activeKeyword ? `SEARCH: "${activeKeyword}"` : `${activeLeague === "ALL" ? "ALL TEAMS" : activeLeague} COLLECTION`}
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm max-w-lg font-medium">
              Explore authentic gear, premium heavy fleece materials, and custom embroidered graphics curated exclusively for true team supporters.
            </p>
          </div>

          {/* Main Grid display of filtered items */}
          <ProductGrid
            league={activeLeague === "ALL" ? undefined : activeLeague}
            type={activeCategory === "ALL" ? undefined : (activeCategory === "Jerseys" ? "jersey" : activeCategory === "Hoodies" ? "hoodie" : activeCategory === "Accessories" ? "accessory" : "tee")}
            team={activeTeam || undefined}
            searchKeyword={activeKeyword || undefined}
          />



          {/* 5. BRAND FEATURES ACCENTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-zinc-900">
            <div className="bg-zinc-900/30 border border-zinc-900/60 rounded-2xl p-5 flex items-start gap-4">
              <div className="bg-blue-600/10 p-3 rounded-xl text-blue-400 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">FREE STANDARD SHIPPING</h4>
                <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                  Qualify for free delivery on standard apparel orders of $75 or more. Tracked and dispatched in 24 hours.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900/60 rounded-2xl p-5 flex items-start gap-4">
              <div className="bg-blue-600/10 p-3 rounded-xl text-blue-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">30-DAY SPORT GUARANTEE</h4>
                <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                  Size didn't work? Swap jerseys hassle-free with our prepaid exchange service. Sportsmanship guaranteed.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-[#00D2FF]/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="bg-blue-600/10 p-3 rounded-xl text-blue-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">100% AUTHENTIC LICENSED GEAR</h4>
                <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                  Official licensing, tackle-twill embroidery, and premium heavy-fleece materials. Never counterfeit.
                </p>
              </div>
            </div>
          </div>

        </section>
      )}

      {/* AUTOMATED SPORTS CINEMATIC VIDEO SLIDE */}
      {activeLeague === "ALL" && activeTeam === null && activeKeyword === null && (
        <SportsCinematicSlide 
          onSelectLeague={handleSelectLeague} 
          onSelectTeam={(league, team) => {
            setActiveLeague(league);
            setActiveTeam(team);
            setActiveKeyword(null);
          }}
          currentIndex={syncSlideIndex}
          onIndexChange={setSyncSlideIndex}
        />
      )}

      {/* JOIN THE FAMILY NEWSLETTER CTA (Always visible on storefront above footer) */}
      <div className="py-10">
        <NewsletterCTA />
      </div>
        </>
      )}

      {/* 6. TRUST FOOTER */}
      <Footer 
        onAboutOpen={() => setIsAboutOpen(true)}
        onChatOpen={() => setIsChatOpen(true)}
        onScrollToCatalog={handleScrollToCatalog}
        onSelectLeague={handleSelectLeague}
        onContactOpen={() => setIsContactOpen(true)}
      />

      {/* 7. FLOATING INTERACTIVE AI CHAT AGENT */}
      <ChatAgent />

      {/* 8. MODAL SLIDER: SHOPPING CART */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* 9. MODAL SLIDER: COACH COR AI CHAT */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onApplyPromo={handleApplyPromo}
        onFilterLeague={(lg) => setActiveLeague(lg)}
      />

      {/* 11. ADMIN PORTAL LOGIN / CONTROLLER MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(email) => {
          showToast(`Admin session unlocked for ${email}`);
        }}
      />

      {/* 10. TOAST COMPLETED NOTIFICATIONS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. STORY OVERLAY MODAL */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* 12.5 CONTACT FORM OVERLAY MODAL */}
      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* 13. WELCOME & DISCOUNT POPUP */}
      <DiscountPopup isOpen={isDiscountOpen} onClose={() => setIsDiscountOpen(false)} />

      {/* 14. THE FAN STAND MODAL OVERLAY */}
      <AnimatePresence>
        {isFanStandOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 overflow-y-auto backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[#050505] w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-900 my-8 flex flex-col h-[90vh]"
            >
              {/* Top decorative gradient line */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-600 via-[#03a9f4] to-indigo-600 z-50" />

              {/* Close Button */}
              <button 
                onClick={() => setIsFanStandOpen(false)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors z-[1100] bg-zinc-950 border border-zinc-900 rounded-full cursor-pointer"
                aria-label="Close Fan Stand"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <FanStand
                  onShowToast={showToast}
                  onOpenChat={() => {
                    setIsChatOpen(true);
                    setIsFanStandOpen(false);
                  }}
                  onScrollToCatalog={() => {
                    setIsFanStandOpen(false);
                    handleScrollToCatalog();
                  }}
                  onAboutOpen={() => setIsAboutOpen(true)}
                  onClose={() => setIsFanStandOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
