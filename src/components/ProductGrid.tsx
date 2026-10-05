import { useState, useEffect, useRef } from "react";
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, query, setDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import ProductCard from "./ProductCard";
import { MASTER_TEAMS_LIST } from "../printifyCatalog";
import FanCorCommerceEngine from "../services/FanCorCommerceEngine";

interface Product {
  id: number | string;
  name: string;
  price: string;
  league?: string;
  team?: string;
  type?: "tee" | "hoodie" | "accessory" | "jersey";
  image?: string;
  source?: "firestore" | "printify";
  active?: boolean;
}

const ADMIN_EMAIL = "jermaineamezquita1973@gmail.com";

interface ProductGridProps {
  league?: string;
  type?: "tee" | "hoodie" | "accessory" | "jersey";
  team?: string;
  searchKeyword?: string;
}

export function ProductGrid({ league, type, team, searchKeyword }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [printifyError, setPrintifyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [manageMode, setManageMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Lightbox & interactive zoom states for t-shirt design viewing
  const [enlargedProduct, setEnlargedProduct] = useState<Product | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Lazy loading states for the products grid
  const [visibleCount, setVisibleCount] = useState(16);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Reset visibleCount when filter dependencies or manage mode change
  useEffect(() => {
    setVisibleCount(16);
  }, [league, type, team, searchKeyword, searchQuery, manageMode]);

  // Safe non-modal dialog, confirm, and notification states
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [hideOptionProductId, setHideOptionProductId] = useState<string | number | null>(null);
  const [hideOptionErrorMsg, setHideOptionErrorMsg] = useState<string>("");

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const checkAdminAuth = () => {
      if (isFirebaseConfigured && auth) {
        setIsAdmin(auth.currentUser?.email === ADMIN_EMAIL);
      } else {
        const savedAdmin = localStorage.getItem("sandbox_admin_user");
        setIsAdmin(savedAdmin === ADMIN_EMAIL);
      }
    };

    checkAdminAuth();
    window.addEventListener("admin-auth-changed", checkAdminAuth);

    let unsubscribe: any = null;
    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAdmin(user?.email === ADMIN_EMAIL);
      });
    }

    return () => {
      window.removeEventListener("admin-auth-changed", checkAdminAuth);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const hideProduct = async (productId: string | number) => {
    try {
      if (!isFirebaseConfigured) {
        const savedHidden = localStorage.getItem("sandbox_hidden_product_ids");
        const hiddenList = savedHidden ? JSON.parse(savedHidden) : [];
        if (!hiddenList.includes(String(productId))) {
          hiddenList.push(String(productId));
        }
        localStorage.setItem("sandbox_hidden_product_ids", JSON.stringify(hiddenList));
        
        setHiddenIds((prev) => new Set([...prev, String(productId)]));
        showToast("Product hidden from store.", "success");
        window.dispatchEvent(new Event("admin-auth-changed"));
        return;
      }

      try {
        await setDoc(doc(db, "hidden_printify_products", String(productId)), {
          productId: String(productId),
          hiddenAt: new Date().toISOString(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "hidden_printify_products");
      }
      setHiddenIds((prev) => new Set([...prev, String(productId)]));
      showToast("Product hidden from store.", "success");
      window.dispatchEvent(new Event("admin-auth-changed"));
    } catch (e) {
      console.error("Hide failed", e);
      showToast("Failed to hide product.", "error");
    }
  };

  const showProduct = async (productId: string | number) => {
    try {
      if (!isFirebaseConfigured) {
        const savedHidden = localStorage.getItem("sandbox_hidden_product_ids");
        const hiddenList = savedHidden ? JSON.parse(savedHidden) : [];
        const nextList = hiddenList.filter((id: any) => String(id) !== String(productId));
        localStorage.setItem("sandbox_hidden_product_ids", JSON.stringify(nextList));
        
        setHiddenIds((prev) => {
          const next = new Set(prev);
          next.delete(String(productId));
          return next;
        });
        showToast("Product is now visible.", "success");
        window.dispatchEvent(new Event("admin-auth-changed"));
        return;
      }

      const { deleteDoc, doc: fDoc } = await import("firebase/firestore");
      try {
        await deleteDoc(fDoc(db, "hidden_printify_products", String(productId)));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, "hidden_printify_products");
      }
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(String(productId));
        return next;
      });
      showToast("Product is now visible.", "success");
      window.dispatchEvent(new Event("admin-auth-changed"));
    } catch (e) {
      console.error("Show failed", e);
      showToast("Failed to make product visible.", "error");
    }
  };

  const deleteProduct = async (product: Product, hideOnPrintifyFailure: boolean = false) => {
    setDeletingId(product.id);
    try {
      if (!isFirebaseConfigured) {
        // Safe delete for Sandbox/local mode
        const savedDeleted = localStorage.getItem("sandbox_deleted_product_ids");
        const deletedIds = savedDeleted ? JSON.parse(savedDeleted) : [];
        if (!deletedIds.includes(String(product.id))) {
          deletedIds.push(String(product.id));
        }
        localStorage.setItem("sandbox_deleted_product_ids", JSON.stringify(deletedIds));

        // Also if it was inside sandbox_added_products, filter it out
        const savedAdded = localStorage.getItem("sandbox_added_products");
        if (savedAdded) {
          const addedList = JSON.parse(savedAdded);
          const nextAdded = addedList.filter((p: any) => String(p.id) !== String(product.id));
          localStorage.setItem("sandbox_added_products", JSON.stringify(nextAdded));
        }

        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast("Product removed from website.", "success");
        window.dispatchEvent(new Event("admin-auth-changed"));
        return;
      }

      // 1. Always try to remove from Firestore first if it's a Firestore source or linked
      if (product.source === "firestore") {
        console.log(`Attempting to delete Firestore product: ${product.id}`);
        // Handle mock and sandbox product deletion
        const isMock = String(product.id).startsWith("mock_") || String(product.id).startsWith("mock-");
        const isSandbox = String(product.id).startsWith("sandbox-prod-");
        
        if (isMock || isSandbox) {
          if (isSandbox) {
            const savedProductsStr = localStorage.getItem("sandbox_added_products");
            if (savedProductsStr) {
              const savedProducts = JSON.parse(savedProductsStr);
              const filtered = savedProducts.filter((p: any) => String(p.id) !== String(product.id));
              localStorage.setItem("sandbox_added_products", JSON.stringify(filtered));
            }
            showToast("Sandbox product removed.", "success");
          } else {
            const savedDeleted = localStorage.getItem("sandbox_deleted_product_ids");
            const sandboxDeletedIds = savedDeleted ? JSON.parse(savedDeleted) : [];
            sandboxDeletedIds.push(String(product.id));
            localStorage.setItem("sandbox_deleted_product_ids", JSON.stringify(sandboxDeletedIds));
            showToast("Mock product removed.", "success");
          }
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          window.dispatchEvent(new Event("admin-auth-changed"));
          return;
        }
        const { deleteDoc, doc: fDoc } = await import("firebase/firestore");
        try {
          await deleteDoc(fDoc(db, "products", String(product.id)));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, "products");
        }
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast("Product successfully removed from store database.", "success");
        return;
      }

      // 2. If it's a Printify source, try to delete from Printify
      if (product.source === "printify") {
        console.log(`Attempting to delete Printify product: ${product.id}`);
        const customApiKey = localStorage.getItem("printify_api_key") || "";
        const customShopId = localStorage.getItem("printify_shop_id") || "";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customApiKey) headers["x-printify-api-key"] = customApiKey;
        if (customShopId) headers["x-printify-shop-id"] = customShopId;

        const res = await fetch("/api/products", {
          method: "DELETE",
          headers,
          body: JSON.stringify({ productId: product.id }),
        });

        const data = await res.json();

        if (res.ok) {
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          showToast("Product successfully removed from Printify inventory.", "success");
        } else {
          console.error("Printify delete failed:", data);
          const errorMsg = data.error || "Unknown error";

          // If it's already deleted on Printify (404), just remove it locally
          if (res.status === 404 || errorMsg.toLowerCase().includes("not found")) {
            console.log("Product already gone from Printify, removing locally...");
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            await hideProduct(product.id);
            showToast("Product was already removed from Printify. It has now been cleared from your website.", "success");
          } else {
            if (hideOnPrintifyFailure) {
              await hideProduct(product.id);
            } else {
              setHideOptionProductId(product.id);
              setHideOptionErrorMsg(errorMsg);
            }
          }
        }
      }
    } catch (e) {
      console.error("Delete failed", e);
      showToast(`An error occurred: ${e instanceof Error ? e.message : "Unknown error"}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let unsubHidden: () => void = () => {};

    // Fetch hidden IDs if Firestore is configured
    if (isFirebaseConfigured && db) {
      try {
        unsubHidden = onSnapshot(collection(db, "hidden_printify_products"), (snapshot) => {
          const ids = new Set(snapshot.docs.map((doc) => doc.data().productId));
          setHiddenIds(ids);
        }, (error) => {
          console.error("Fetch hidden IDs error:", error);
          handleFirestoreError(error, OperationType.GET, "hidden_printify_products");
        });
      } catch (err) {
        console.error("Failed to setup hidden products subscriber:", err);
      }
    } else {
      const savedHidden = localStorage.getItem("sandbox_hidden_product_ids");
      const hiddenIdsList = savedHidden ? JSON.parse(savedHidden) : [];
      const hiddenSet = new Set(hiddenIdsList.map((id: any) => String(id)));
      setHiddenIds(hiddenSet);
    }

    console.log("ProductGrid mounted, fetching products...");

    const loadAllProducts = async (force = false) => {
      setLoading(true);
      try {
        const data = await FanCorCommerceEngine.getProducts(force);
        setProducts(data);
        setPrintifyError(null);
      } catch (err: any) {
        console.error("Failed to load products in ProductGrid:", err);
        setPrintifyError(err instanceof Error ? err.message : "Error loading products");
      } finally {
        setLoading(false);
      }
    };

    loadAllProducts();

    const handleProductsSynced = () => {
      console.log("Products synced event received. Re-fetching products in ProductGrid...");
      loadAllProducts(true);
    };
    window.addEventListener("products-synced", handleProductsSynced);

    const handleAdminAuthChanged = () => {
      console.log("Admin auth changed event received. Re-fetching products...");
      loadAllProducts(true);
    };
    window.addEventListener("admin-auth-changed", handleAdminAuthChanged);

    return () => {
      unsubHidden();
      window.removeEventListener("products-synced", handleProductsSynced);
      window.removeEventListener("admin-auth-changed", handleAdminAuthChanged);
    };
  }, []);

  // Filtering logic
  let filteredProducts = products;

  if (!isFirebaseConfigured) {
    const savedDeleted = localStorage.getItem("sandbox_deleted_product_ids");
    if (savedDeleted) {
      try {
        const deletedIds = JSON.parse(savedDeleted);
        const deletedSet = new Set(deletedIds.map((id: any) => String(id)));
        filteredProducts = filteredProducts.filter((p) => !deletedSet.has(String(p.id)));
      } catch (err) {
        console.error("Failed to filter deleted products", err);
      }
    }
  }

  // Filter products to strictly real active Printify catalog designs and custom Firestore/Sandbox merchandise
  filteredProducts = filteredProducts.filter((p) => {
    // If a specific category/type is requested, respect it.
    if (type && p.type !== type) {
      return false;
    }
    
    return p.source === "printify" || p.source === "firestore" || p.source === "manual";
  });

  if (!manageMode) {
    // Normal view: Hide products in hiddenIds or if they are explicitly marked as inactive (not live on site)
    filteredProducts = filteredProducts.filter((p) => !hiddenIds.has(String(p.id)) && p.active !== false);
  }

  // Determine league of the team if league is not provided
  let effectiveLeague = league;
  if (team && !effectiveLeague) {
    const found = MASTER_TEAMS_LIST.find((t) => t.team.toLowerCase() === team.toLowerCase());
    if (found) {
      effectiveLeague = found.league;
    }
  }

  if (effectiveLeague) {
    filteredProducts = filteredProducts.filter((p) => p.league?.toUpperCase() === effectiveLeague.toUpperCase());
  }

  if (team) {
    const normalizeCompare = (str: string) =>
      str.toLowerCase()
        .replace(/\./g, "")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const sTeamClean = normalizeCompare(team);

    filteredProducts = filteredProducts.filter((p) => {
      if (!p.team) return false;
      const pTeamClean = normalizeCompare(p.team);
      return pTeamClean === sTeamClean || pTeamClean.includes(sTeamClean) || sTeamClean.includes(pTeamClean);
    });

    if (sTeamClean === "miami heat") {
      filteredProducts = filteredProducts.slice(0, 4);
    }
  }

  if (type) {
    filteredProducts = filteredProducts.filter((p) => p.type === type);
  }

  // Search filter from Dashboard view (passed from parent props)
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(kw) ||
      (p.team && p.team.toLowerCase().includes(kw)) ||
      (p.league && p.league.toLowerCase().includes(kw))
    );
  }

  // Local grid search filter
  if (searchQuery) {
    const queryStr = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(queryStr) ||
      p.id.toString().toLowerCase().includes(queryStr)
    );
  }

  // IntersectionObserver effect to load next chunk of products
  useEffect(() => {
    const observerTarget = loaderRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < filteredProducts.length) {
              return prev + 12; // Load in smaller chunks of 12
            }
            return prev;
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "250px"
      }
    );

    observer.observe(observerTarget);
    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [filteredProducts.length]);

  const addToCart = (product: Product) => {
    const event = new CustomEvent("add-to-cart", { detail: product });
    window.dispatchEvent(event);
  };

  // Lightbox carousel handlers (defined here so filteredProducts is fully calculated)
  const handlePrevProduct = () => {
    if (!enlargedProduct) return;
    const currentIndex = filteredProducts.findIndex((p) => p.id === enlargedProduct.id);
    if (currentIndex > 0) {
      setEnlargedProduct(filteredProducts[currentIndex - 1]);
      setZoomScale(1);
    } else {
      setEnlargedProduct(filteredProducts[filteredProducts.length - 1]);
      setZoomScale(1);
    }
  };

  const handleNextProduct = () => {
    if (!enlargedProduct) return;
    const currentIndex = filteredProducts.findIndex((p) => p.id === enlargedProduct.id);
    if (currentIndex < filteredProducts.length - 1) {
      setEnlargedProduct(filteredProducts[currentIndex + 1]);
      setZoomScale(1);
    } else {
      setEnlargedProduct(filteredProducts[0]);
      setZoomScale(1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enlargedProduct) return;
      if (e.key === "Escape") setEnlargedProduct(null);
      if (e.key === "ArrowLeft") handlePrevProduct();
      if (e.key === "ArrowRight") handleNextProduct();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enlargedProduct, filteredProducts]);

  return (
    <section id="shop" className="py-20 px-[5%] max-w-[1400px] mx-auto bg-[#111] rounded-3xl my-10 shadow-2xl border border-white/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b-4 border-[#4fc3f7] pb-4">
        <div>
          <h2 className="font-anton text-[40px] text-white uppercase leading-none">
            {team ? `${team} T-Shirts` : league ? `${league} T-Shirts` : "Team T-Shirts"}
          </h2>
        </div>
        {isAdmin && (
          <button
            onClick={() => setManageMode(!manageMode)}
            className={`font-sans font-black text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer border ${
              manageMode
                ? "bg-[#4fc3f7] text-zinc-950 border-[#4fc3f7] hover:bg-[#4fc3f7]/90"
                : "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700"
            }`}
          >
            {manageMode ? "Exit Management" : "Manage Products"}
          </button>
        )}
      </div>

      {printifyError && (
        <div className="mb-8 p-6 bg-red-950/40 border border-red-500/20 rounded-2xl text-red-200 text-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-bold text-base flex items-center gap-2 text-red-400">
              ⚠️ Printify Connection Offline
            </p>
            <p className="text-xs text-zinc-400 max-w-xl">
              The store could not sync with your Printify account. Reason:
            </p>
            <p className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-red-950 text-red-300 inline-block">
              {printifyError}
            </p>
          </div>
          <div className="shrink-0 text-xs bg-[#18181c] border border-zinc-800 p-4 rounded-xl text-zinc-300 space-y-1.5 max-w-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[10px] text-[#4fc3f7]">How to link your products:</p>
            <p>1. Open **Settings &gt; Secrets** in Google AI Studio.</p>
            <p>2. Paste your real **PRINTIFY_API_KEY** and **PRINTIFY_SHOP_ID**.</p>
            <p>3. Restart the dev server to apply these settings.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-white text-center py-20">Loading products...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                manageMode={manageMode}
                isHidden={hiddenIds.has(String(product.id))}
                showProduct={showProduct}
                hideProduct={hideProduct}
                deleteProduct={deleteProduct}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                deletingId={deletingId}
                onEnlarge={(prod) => {
                  setEnlargedProduct(prod);
                  setZoomScale(1);
                }}
              />
            ))}
          </div>

          {/* Infinite Scroll/Intersection Observer Trigger */}
          {visibleCount < filteredProducts.length && (
            <div ref={loaderRef} className="flex flex-col justify-center items-center py-12 mt-10 border-t border-white/5">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4fc3f7] border-t-transparent"></div>
              <span className="text-xs text-[#4fc3f7] font-mono mt-3 uppercase tracking-widest animate-pulse">
                Loading more designs...
              </span>
            </div>
          )}
        </>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-10 text-white/60">
          <p>No products found in this collection.</p>
          <p className="text-sm mt-2">Try adding tags (NFL, NBA, etc.) to your products in Printify.</p>
        </div>
      )}

      {/* Lightbox Modal for Product Image Enlargement with Dynamic Zoom-Out & Zoom-In */}
      <AnimatePresence>
        {enlargedProduct && enlargedProduct.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none"
            onClick={() => setEnlargedProduct(null)}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-0 inset-x-0 bg-black/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-50 border-b border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-[50%] lg:max-w-[65%]">
                <p className="text-white font-anton text-base lg:text-xl uppercase tracking-wide truncate">{enlargedProduct.name}</p>
                <p className="text-[#4fc3f7] font-bold text-sm">{enlargedProduct.price}</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 lg:gap-4 font-sans">
                {/* Zoom % */}
                <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono hidden sm:inline-block">
                  Scale: {Math.round(zoomScale * 100)}%
                </span>

                {/* Instant Fit Preset (Zoom Out to 100%) */}
                <button
                  onClick={() => {
                    setZoomScale(1.0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                    zoomScale === 1.0
                      ? "bg-[#4fc3f7] text-[#0f2d4a] border-[#4fc3f7]"
                      : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10"
                  }`}
                  title="Show complete layout of the shirt design"
                >
                  <Minimize2 className="w-3.5 h-3.5" /> Complete Design Focus
                </button>

                {/* Instant Zoom Preset (2.0x detail zoom) */}
                <button
                  onClick={() => {
                    setZoomScale(2.0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                    zoomScale === 2.0
                      ? "bg-[#4fc3f7] text-[#0f2d4a] border-[#4fc3f7]"
                      : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10"
                  }`}
                  title="Zoom in on fabric and design files"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Fabric Detail Focus
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setEnlargedProduct(null)}
                className="p-2.5 bg-white/5 text-white/70 rounded-full hover:bg-white/10 hover:text-white transition-all cursor-pointer border border-white/10 shadow-lg"
                title="Close View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stage & Arrows */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEnlargedProduct(null);
                }
              }}
            >
              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevProduct();
                }}
                className="absolute left-4 lg:left-8 z-40 p-3.5 rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-[#4fc3f7]/20 border border-white/10 hover:border-[#4fc3f7]/30 transition-all cursor-pointer shadow-2xl backdrop-blur-sm hover:scale-105 active:scale-95"
                title="Previous shirt design"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextProduct();
                }}
                className="absolute right-4 lg:right-8 z-40 p-3.5 rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-[#4fc3f7]/20 border border-white/10 hover:border-[#4fc3f7]/30 transition-all cursor-pointer shadow-2xl backdrop-blur-sm hover:scale-105 active:scale-95"
                title="Next shirt design"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Image Area */}
              <div
                className="relative max-w-[95vw] max-h-[70vh] w-full h-full flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  // Cycle zoom Scale on Click / Tap directly on the shirt design
                  setZoomScale((prev) => {
                    if (prev === 1.0) return 0.65; // Zoom out first to see full shirt
                    if (prev === 0.65) return 2.0; // Zoom in for fabric detail
                    return 1.0; // Return to standard fit
                  });
                }}
              >
                <motion.div
                  key={enlargedProduct.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="w-full h-full flex items-center justify-center relative cursor-move"
                >
                  <motion.div
                    drag
                    dragConstraints={{ left: -500, right: 500, top: -350, bottom: 350 }}
                    dragElastic={0.15}
                    style={{
                      scale: zoomScale,
                    }}
                    className="relative w-full h-full max-w-[750px] max-h-[550px] flex items-center justify-center"
                  >
                    <img
                      src={enlargedProduct.image!}
                      alt={enlargedProduct.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_20px_60px_rgba(3,169,244,0.18)]"
                    />
                  </motion.div>
                </motion.div>
              </div>

              {/* Help tip */}
              <div className="absolute bottom-20 z-40 bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-[10px] lg:text-xs uppercase tracking-wider text-white/60 flex items-center gap-2 pointer-events-none text-center">
                <span className="text-[#4fc3f7] font-bold">💡 Design Tip:</span> Click/Tap the shirt directly to cycle zoom levels (Overview ➔ Normal ➔ Detail) or drag around!
              </div>
            </div>

            {/* Slider zoom controls toolbar at the very bottom */}
            <div
              className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md py-4 px-6 flex items-center justify-center gap-4 z-50 border-t border-white/5 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoomScale((prev) => Math.max(0.4, Number((prev - 0.2).toFixed(1))))}
                  disabled={zoomScale <= 0.4}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                  title="Zoom Out (Complete fit)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.05"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="w-36 lg:w-52 accent-[#4fc3f7] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                />

                <button
                  onClick={() => setZoomScale((prev) => Math.min(3.0, Number((prev + 0.2).toFixed(1))))}
                  disabled={zoomScale >= 3.0}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setZoomScale(1.0);
                  }}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                  title="Restore Original Fit Size"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Fit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback Option Modal for Printify Deletions */}
      <AnimatePresence>
        {hideOptionProductId && (
          <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4 font-sans">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <X className="w-6 h-6" />
              </div>
              <h3 className="font-anton text-lg uppercase tracking-wide text-white">FAILED TO DELETE FROM PRINTIFY</h3>
              <p className="text-white/60 text-xs text-left p-3 bg-black/40 rounded-lg font-mono truncate-3-lines">
                Error: {hideOptionErrorMsg}
              </p>
              <p className="text-white/70 text-sm">
                Printify API rejected the deletion. Would you like to hide this product from your storefront website instead?
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    await hideProduct(hideOptionProductId);
                    setHideOptionProductId(null);
                  }}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Yes, Hide Product
                </button>
                <button
                  onClick={() => setHideOptionProductId(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Toast Notices */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[10000] bg-black/90 border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md font-sans"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              toast.type === "success" ? "bg-green-500 animate-pulse" : toast.type === "error" ? "bg-red-500 animate-pulse" : "bg-[#4fc3f7] animate-pulse"
            }`} />
            <span className="text-white text-xs font-semibold uppercase tracking-wider">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
