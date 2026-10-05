import React from "react";
import { motion } from "motion/react";
import { ShoppingCart, Sparkles, Award, ZoomIn } from "lucide-react";

interface ProductCardProps {
  key?: React.Key;
  product: any;
  onAddToCart: (product: any) => void;
  manageMode?: boolean;
  isHidden?: boolean;
  showProduct?: (id: string | number) => void;
  hideProduct?: (id: string | number) => void;
  deleteProduct?: (product: any) => void;
  confirmDeleteId?: string | number | null;
  setConfirmDeleteId?: (id: string | number | null) => void;
  deletingId?: string | number | null;
  onEnlarge?: (product: any) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  manageMode = false,
  isHidden = false,
  showProduct,
  hideProduct,
  deleteProduct,
  confirmDeleteId = null,
  setConfirmDeleteId,
  deletingId = null,
  onEnlarge,
}: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);

  // Premium vector icons renderers
  const renderProductIcon = (prodType?: string) => {
    switch (prodType) {
      case "jersey":
        return (
          <svg className="w-16 h-16 text-white/80 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3L8 6V11H16V6L18 3H14V5H10V3H6Z" fill="currentColor" opacity="0.1" />
            <path d="M6 3L8 6V21H16V6L18 3H14V5C14 6.1 13.1 7 12 7C10.9 7 10 6.1 10 5V3H6Z" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="10" x2="14" y2="10" strokeLinecap="round" />
            <line x1="10" y1="13" x2="14" y2="13" strokeLinecap="round" />
            <line x1="10" y1="16" x2="14" y2="16" strokeLinecap="round" />
            <circle cx="12" cy="11.5" r="1.5" stroke="none" fill="currentColor" opacity="0.3" />
          </svg>
        );
      case "hoodie":
        return (
          <svg className="w-16 h-16 text-white/80 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C8 2 6 4 6 7V11H18V7C18 4 16 2 12 2Z" fill="currentColor" opacity="0.1" />
            <path d="M6 11V21H18V11" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2C9.5 2 7 3.5 7 6.5C7 8 8.5 9 12 9C15.5 9 17 8 17 6.5C17 3.5 14.5 2 12 2Z" />
            <path d="M10 9V14" strokeLinecap="round" />
            <path d="M14 9V14" strokeLinecap="round" />
            <path d="M8 17H16V21H8V17Z" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
          </svg>
        );
      case "accessory":
        return (
          <svg className="w-16 h-16 text-white/80 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4C7 4 4 7 4 12H20C20 7 17 4 12 4Z" fill="currentColor" opacity="0.1" />
            <path d="M4 12C4 15 7 16 12 16C17 16 20 15 20 12" strokeLinecap="round" />
            <path d="M4 12H2C1 12 1 14 2 14C4 14.5 7 15 12 15C17 15 20 14.5 22 14C23 14 23 12 22 12H20" strokeLinecap="round" />
            <path d="M12 4V3" />
            <circle cx="12" cy="3" r="1" fill="currentColor" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-white/80 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4L9 7V21H15V7L18 4H14V5.5C14 6.5 13 7.5 12 7.5C11 7.5 10 6.5 10 5.5V4H6Z" fill="currentColor" opacity="0.1" />
            <path d="M6 4L9 7V21H15V7L18 4H14V5.5C14 6.5 13 7.5 12 7.5C11 7.5 10 6.5 10 5.5V4H6Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const getLeagueBadgeStyles = (lgName?: string) => {
    switch (lgName) {
      case "NFL": return "bg-blue-600/20 text-blue-400 border-blue-500/30";
      case "NBA": return "bg-red-600/20 text-red-400 border-red-500/30";
      case "WNBA": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MLB": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "NHL": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "MLS": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const formattedPrice = typeof product.price === "number" ? `$${product.price.toFixed(2)}` : String(product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col group select-none relative ${
        isHidden ? "opacity-40 grayscale" : ""
      }`}
    >
      {manageMode && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-col gap-2 z-30">
          <div className="flex justify-between items-center gap-1.5">
            <div className="flex flex-col items-start gap-1">
              <span className="bg-black/90 text-white text-[9px] px-2.5 py-1 rounded-md font-mono border border-zinc-800 shadow-xl">
                ID: {product.id}
              </span>
              {isHidden && (
                <span className="bg-amber-600/20 text-amber-400 border border-amber-500/20 text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  HIDDEN
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {isHidden ? (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showProduct?.(product.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  SHOW
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    hideProduct?.(product.id);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  HIDE
                </button>
              )}
              {confirmDeleteId === product.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteProduct?.(product);
                      setConfirmDeleteId?.(null);
                    }}
                    className="bg-red-700 text-white text-[9px] font-black px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all uppercase tracking-wider animate-pulse whitespace-nowrap cursor-pointer shadow-lg"
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDeleteId?.(null);
                    }}
                    className="bg-zinc-800 text-white text-[9px] font-bold px-2 py-1.5 rounded-lg hover:bg-zinc-700 transition-all cursor-pointer shadow-lg"
                  >
                    X
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDeleteId?.(product.id);
                    setTimeout(() => {
                      if (setConfirmDeleteId) {
                        setConfirmDeleteId(null);
                      }
                    }, 4000);
                  }}
                  disabled={deletingId === product.id}
                  className={`text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-lg transition-all cursor-pointer ${
                    deletingId === product.id 
                      ? "bg-zinc-800 cursor-not-allowed" 
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {deletingId === product.id ? "..." : "DELETE"}
                </button>
              )}
            </div>
          </div>
          {product.source === "printify" && (
            <a 
              href={`https://printify.com/app/store/23199113/products/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 text-[#00D2FF] text-[8px] font-black py-1 px-2 rounded-md text-center hover:bg-zinc-800 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              VERIFY ON PRINTIFY
            </a>
          )}
        </div>
      )}

      {/* Visual Product Box - Image or Styled Fallback */}
      <div 
        onClick={() => {
          if (!manageMode) {
            onEnlarge?.(product);
          }
        }}
        className={`aspect-[4/5] max-h-[400px] w-full relative flex items-center justify-center overflow-hidden cursor-pointer ${
          (product.image && !imageError) ? "bg-zinc-900/50" : `bg-gradient-to-br ${product.imageColor || "from-zinc-900 to-zinc-950"}`
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.04),transparent_50%)]"></div>
        
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/5 px-2.5 py-0.5 rounded-full text-[9px] font-black text-zinc-400 tracking-wider">
          {(product.type || "tee").toUpperCase()}
        </div>

        {product.badge && (
          <div className="absolute top-3 right-3 bg-[#00D2FF] text-zinc-950 text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-md flex items-center gap-1 z-10">
            <Sparkles className="w-2.5 h-2.5 text-zinc-950" />
            {product.badge}
          </div>
        )}

        <div className="absolute bottom-2 left-4 text-[40px] font-black text-white/[0.02] select-none tracking-tighter">
          {product.league}
        </div>

        {product.image && !imageError ? (
          <img 
            src={product.image} 
            alt={product.name || product.title} 
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />
        ) : (
          <div className="transform group-hover:scale-110 transition-transform duration-300 relative z-10 flex flex-col items-center justify-center p-4">
            {renderProductIcon(product.type)}
            <p className="text-[10px] font-mono text-[#00D2FF]/80 mt-2.5 uppercase tracking-widest font-extrabold text-center max-w-[180px] truncate">
              {product.team || "FANCOR APPAREL"}
            </p>
          </div>
        )}
        
        {!manageMode && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-[#00D2FF] text-zinc-950 px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <ZoomIn className="w-3.5 h-3.5 text-zinc-950" />
              Quick View
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
      </div>

      {/* Item Details */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border tracking-widest uppercase ${getLeagueBadgeStyles(product.league)}`}>
            {product.league || "ALL"}
          </span>
          <span className="text-zinc-600 text-[10px] flex items-center gap-1 font-mono font-bold">
            <Award className="w-3 h-3 text-zinc-700" />
            OFFICIAL
          </span>
        </div>

        <h3 className="text-white text-base font-bold tracking-tight mb-1.5 group-hover:text-[#00D2FF] transition-colors leading-snug line-clamp-2 min-h-[44px]">
          {product.name || product.title}
        </h3>

        <p className="text-zinc-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
          {product.description || "Curated premium double-knit athletic sportswear. Extremely comfortable with double-fleece styling."}
        </p>

        {/* Pricing and cart action */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3.5 border-t border-zinc-900">
          <div className="flex flex-col">
            <span className="text-zinc-600 text-[9px] font-black tracking-wider uppercase leading-none">PRICE</span>
            <span className="text-white text-base font-black tracking-tight font-mono mt-1">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all hover:scale-[1.03] cursor-pointer flex items-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            ADD TO CART
          </button>
        </div>
      </div>
    </motion.div>
  );
}
