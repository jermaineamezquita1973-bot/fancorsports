import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, Tag, ShieldCheck, Truck, CreditCard, Sparkles, ShoppingBag } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

// Helper to safely parse any format of product price
const getProductPrice = (price: any): number => {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem("active_promo") || "");
  const [discountApplied, setDiscountApplied] = useState(() => localStorage.getItem("active_promo") === "ICONZ20");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "expedited">("standard");
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = localStorage.getItem("active_promo");
      if (active === "ICONZ20") {
        setCouponCode("ICONZ20");
        setDiscountApplied(true);
      }
    }
  }, [isOpen]);

  // Subtotal calculations using safe price parser
  const subtotal = cartItems.reduce((acc, item) => acc + getProductPrice(item.product.price) * item.quantity, 0);
  
  // Coupon check
  const isCouponValid = couponCode.trim().toUpperCase() === "ICONZ20";
  const discountRate = discountApplied ? 0.20 : 0;
  const discountAmount = subtotal * discountRate;

  // Free shipping threshold
  const freeShippingThreshold = 75;
  const shippingCost = subtotal >= freeShippingThreshold && shippingMethod === "standard"
    ? 0
    : shippingMethod === "standard"
      ? 5.99
      : 14.99;

  const orderTotal = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCouponValid) {
      setDiscountApplied(true);
      localStorage.setItem("active_promo", "ICONZ20");
    } else {
      alert("Invalid coupon code. Try ICONZ20 for 20% off!");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // 1. Fetch Stripe configuration status
      const configRes = await fetch("/api/checkout/config");
      const config = await configRes.json();
      
      if (!config.stripeConfigured) {
        // Fallback to Mock checkout if Stripe is not yet configured
        console.log("Stripe not configured. Falling back to Mock Checkout...");
        setCheckoutComplete(true);
        setTimeout(() => {
          onClearCart();
          setCheckoutComplete(false);
          onClose();
        }, 4000);
        return;
      }

      // 2. Request Stripe Checkout Session creation from the backend
      const sessionRes = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          couponCode: discountApplied ? couponCode : "",
          shippingMethod,
        }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok || !sessionData.url) {
        throw new Error(sessionData.error || "Failed to create Stripe Checkout session");
      }

      // 3. Redirect the browser to Stripe Checkout!
      window.location.href = sessionData.url;
    } catch (err: any) {
      console.warn("Stripe redirect failed:", err);
      alert(`Stripe Checkout is currently in configuration mode. Proceeding with instant Mock Checkout demonstration...`);
      
      // Fallback to beautiful Mock Checkout
      setCheckoutComplete(true);
      setTimeout(() => {
        onClearCart();
        setCheckoutComplete(false);
        onClose();
      }, 4000);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Cart Panel Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col shadow-2xl select-none"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-500/15 p-2 rounded-lg text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-extrabold tracking-tight">Shopping Cart</h2>
                  <p className="text-zinc-500 text-xs font-medium font-mono">{cartItems.length} items selected</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-2 rounded-full transition-colors"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {checkoutComplete ? (
                /* Success checkout state */
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                  <div className="bg-emerald-500/15 p-5 rounded-full text-emerald-400 animate-bounce">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h3 className="text-white text-xl font-bold">Order Received!</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Thank you for shopping at <span className="text-blue-400 font-bold">FANCOR ICONZ</span>! Your team apparel is being prepared. Tracking details will be emailed shortly.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-mono bg-zinc-900 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    COUPON SAVINGS APPLIED!
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                /* Empty Cart State */
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="text-zinc-700 text-5xl">🛒</div>
                  <div>
                    <p className="text-white font-bold text-sm">Your cart is currently empty</p>
                    <p className="text-zinc-500 text-xs mt-1 max-w-xs mx-auto">
                      Explore the "Shop By Collection" page and add premium athletic team gear to your active bag.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 px-5 py-2 rounded-full text-xs font-bold transition-all"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : (
                /* Active Cart Item List */
                <>
                  {/* Free Shipping Progress bar */}
                  <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 text-xs mb-2">
                      <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-400" />
                        Standard Shipping Progress
                      </span>
                      <span className="text-white font-mono font-bold">
                        {subtotal >= freeShippingThreshold ? "Unlocked!" : `$${subtotal.toFixed(2)} / $75.00`}
                      </span>
                    </div>

                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${freeShippingProgress}%` }}
                      ></div>
                    </div>

                    <p className="text-[10.5px] text-zinc-500 mt-2">
                      {subtotal >= freeShippingThreshold
                        ? "🎉 Congrats! You qualified for FREE Standard Shipping."
                        : `Spend $${(freeShippingThreshold - subtotal).toFixed(2)} more to unlock free standard shipping.`}
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl hover:border-zinc-850 transition-colors"
                      >
                        {/* Visual item icon */}
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.product.imageColor || 'from-zinc-900 to-zinc-950'} flex items-center justify-center text-xs font-black text-white/50 relative overflow-hidden flex-shrink-0`}>
                          <span className="text-[10px] absolute top-1 left-1 bg-black/40 px-1 rounded text-white/70 z-10">
                            {item.product.league}
                          </span>
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1 relative z-0" />
                          ) : (
                            <span className="text-xl">👕</span>
                          )}
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-white text-xs font-extrabold truncate">{item.product.name}</h4>
                            <p className="text-zinc-500 text-[10px] uppercase font-mono mt-0.5">{item.product.league} | {item.product.category}</p>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-850 p-1">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="text-zinc-500 hover:text-white p-1 rounded-md"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-white font-mono text-xs font-bold px-2">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="text-zinc-500 hover:text-white p-1 rounded-md"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price / Delete */}
                            <div className="flex items-center gap-3">
                              <span className="text-white font-mono text-xs font-black">
                                ${(getProductPrice(item.product.price) * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-zinc-500 hover:text-red-400 p-1 rounded"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Method Selector */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3">
                    <span className="text-zinc-400 text-xs font-bold block">Delivery Option</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShippingMethod("standard")}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          shippingMethod === "standard"
                            ? "bg-blue-600/10 border-blue-500 text-white"
                            : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span className="text-xs font-bold block">Standard</span>
                        <span className="text-[10px] font-mono">
                          {subtotal >= freeShippingThreshold ? "FREE" : "$5.99"} • 3-5 days
                        </span>
                      </button>

                      <button
                        onClick={() => setShippingMethod("expedited")}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          shippingMethod === "expedited"
                            ? "bg-blue-600/10 border-blue-500 text-white"
                            : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span className="text-xs font-bold block">Expedited</span>
                        <span className="text-[10px] font-mono">$14.99 • 1-2 days</span>
                      </button>
                    </div>
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={discountApplied}
                        className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-zinc-700 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={discountApplied || !couponCode}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl border border-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-all"
                    >
                      {discountApplied ? "Applied" : "Apply"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Bottom calculation footer panel */}
            {cartItems.length > 0 && !checkoutComplete && (
              <div className="p-5 border-t border-zinc-900 bg-zinc-950 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Subtotal</span>
                    <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountApplied && (
                    <div className="flex justify-between text-yellow-500">
                      <span className="font-bold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Discount (20% OFF)
                      </span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Shipping</span>
                    <span className="text-white font-mono">
                      {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex justify-between text-sm items-end">
                    <span className="text-zinc-300 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-white text-lg font-black font-mono tracking-tight text-blue-400">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 text-xs transition-all hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      CREATING STRIPE SESSION...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      PROCEED TO SECURE CHECKOUT
                    </>
                  )}
                </button>

                <div className="text-[10px] text-zinc-600 text-center flex items-center justify-center gap-1">
                  🔒 Secure SSL checkout • 100% Authentic Apparel Guaranteed
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
