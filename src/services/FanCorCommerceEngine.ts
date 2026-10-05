/**
 * FanCorCommerceEngine
 * Core commerce layer for FanCor Iconz
 * Handles product loading, caching, filtering, and external sync hooks (Printify / Firestore ready)
 */

import { isFirebaseConfigured, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { mapPrintifyProductsToCatalog, MASTER_TEAMS_LIST } from "../printifyCatalog";
import { TeamCatalog } from "../types";

export type Product = {
  id: string | number;
  printifyId?: string | number;
  active?: boolean;
  title: string;
  name: string; // Alias to match UI expectation
  price: string | number; // Formatted price expected by UI (e.g. "$65.00" or numeric)
  priceNum: number; // Numeric value for sorting and filtering
  image?: string;
  category?: string;
  team?: string;
  league?: string;
  inventory?: number;
  source?: "printify" | "manual" | "firestore";
  type?: "tee" | "hoodie" | "accessory" | "jersey";
  imageColor?: string;
  badge?: string;
  description?: string;
  variantId?: string | number | null;
};

type ProductCache = {
  data: Product[];
  lastUpdated: number;
};

class FanCorCommerceEngine {
  private static instance: FanCorCommerceEngine;

  private cache: ProductCache = {
    data: [],
    lastUpdated: 0,
  };

  private CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  private constructor() {}

  // Singleton (prevents multiple instances breaking state)
  public static getInstance(): FanCorCommerceEngine {
    if (!FanCorCommerceEngine.instance) {
      FanCorCommerceEngine.instance = new FanCorCommerceEngine();
    }
    return FanCorCommerceEngine.instance;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return (
      this.cache.data.length > 0 &&
      Date.now() - this.cache.lastUpdated < this.CACHE_TTL
    );
  }

  /**
   * MAIN: Get products (with caching)
   */
  public async getProducts(forceRefresh = false): Promise<Product[]> {
    if (this.isCacheValid() && !forceRefresh) {
      return this.cache.data;
    }

    const products = await this.fetchProducts();

    this.cache = {
      data: products,
      lastUpdated: Date.now(),
    };

    return products;
  }

  /**
   * Fetch products from sources
   */
  private async fetchProducts(): Promise<Product[]> {
    try {
      // 🔌 PRINTIFY HOOK - Load live active Printify products
      const printifyProducts = await this.fetchFromPrintify();

      // 🔌 FIRESTORE HOOK - Load live custom products
      let firestoreProducts: Product[] = [];
      if (isFirebaseConfigured && db) {
        try {
          const { collection, getDocs, query } = await import("firebase/firestore");
          const q = query(collection(db, "products"));
          const snapshot = await getDocs(q);
          firestoreProducts = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const priceNum = typeof data.price === "number" ? data.price : parseFloat(String(data.price).replace(/[$,]/g, "")) || 0;
            const priceStr = typeof data.price === "number" ? `$${data.price.toFixed(2)}` : data.price;
            return {
              id: docSnap.id,
              printifyId: data.printifyId || "",
              title: data.name || data.title || "",
              name: data.name || data.title || "",
              price: priceStr,
              priceNum,
              league: data.collection || "Other",
              team: data.team || "",
              type: data.type || "tee",
              category: data.category,
              imageColor: data.imageColor,
              image: data.image,
              badge: data.badge,
              description: data.description,
              source: "firestore" as const,
            };
          }) as Product[];
        } catch (err) {
          console.warn("Firestore fetch error inside CommerceEngine:", err);
          handleFirestoreError(err, OperationType.GET, "products");
        }
      } else {
        // Load local sandbox products
        try {
          const savedProductsStr = typeof window !== "undefined" ? window.localStorage.getItem("sandbox_added_products") : null;
          if (savedProductsStr) {
            const sandboxProducts = JSON.parse(savedProductsStr);
            firestoreProducts = sandboxProducts.map((p: any) => {
              const priceNum = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[$,]/g, "")) || 0;
              const priceStr = typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price;
              
              const getProductType = (data: any): "jersey" | "hoodie" | "accessory" | "tee" => {
                const cat = String(data.category || data.type || "").toLowerCase();
                if (cat.includes("jersey")) return "jersey";
                if (cat.includes("hoodie") || cat.includes("sweat")) return "hoodie";
                if (cat.includes("accessor") || cat.includes("cap") || cat.includes("hat")) return "accessory";
                if (cat.includes("tee") || cat.includes("shirt")) return "tee";
                
                const nameLower = String(data.name || "").toLowerCase();
                if (nameLower.includes("jersey")) return "jersey";
                if (nameLower.includes("hoodie") || nameLower.includes("sweat")) return "hoodie";
                if (nameLower.includes("hat") || nameLower.includes("cap")) return "accessory";
                return "tee";
              };

              return {
                id: p.id,
                printifyId: p.printifyId || "",
                title: p.name || p.title || "",
                name: p.name || p.title || "",
                price: priceStr,
                priceNum,
                league: p.collection || "Other",
                team: p.team || "",
                type: p.type || getProductType(p),
                category: p.category,
                imageColor: p.imageColor,
                image: p.imageUrl || p.image,
                badge: p.badge,
                description: p.description,
                source: "firestore" as const,
              };
            });
          }
        } catch (err) {
          console.warn("Failed to load local sandbox products in CommerceEngine:", err);
        }
      }

      // Merge and associate custom manual/Firestore link overrides with raw Printify products
      const printifyWithOverrides = printifyProducts.map((p) => {
        const override = firestoreProducts.find((f) => {
          const fPid = String(f.printifyId || f.id || "").trim();
          const pPid = String(p.printifyId || p.id || "").trim();
          return fPid !== "" && pPid !== "" && fPid === pPid;
        });

        if (override) {
          return {
            ...p,
            team: override.team || p.team,
            league: override.league || p.league,
            category: override.category || p.category,
            type: override.type || p.type,
            title: override.title || p.title,
            name: override.name || p.name,
            badge: override.badge || p.badge,
            description: override.description || p.description,
            price: override.priceNum > 0 ? override.price : p.price,
            priceNum: override.priceNum > 0 ? override.priceNum : p.priceNum,
            active: override.active !== undefined ? override.active : p.active,
          };
        }
        return p;
      });

      // Include standalone custom products that do not target any specific Printify product
      const standaloneCustom = firestoreProducts.filter((f) => {
        const fPid = String(f.printifyId || f.id || "").trim();
        if (fPid === "") return true;
        return !printifyProducts.some((p) => {
          const pPid = String(p.printifyId || p.id || "").trim();
          return pPid === fPid;
        });
      });

      return [...printifyWithOverrides, ...standaloneCustom];
    } catch (err) {
      console.log("FanCorCommerceEngine fetch error:", err);
      return [];
    }
  }

  /**
   * FILTER: by category / team / league
   */
  public filterProducts(
    products: Product[],
    filters: {
      category?: string;
      team?: string;
      league?: string;
    }
  ): Product[] {
    return products.filter((p) => {
      const matchCategory = filters.category
        ? p.category === filters.category
        : true;

      const matchTeam = filters.team ? p.team === filters.team : true;

      const matchLeague = filters.league ? p.league === filters.league : true;

      return matchCategory && matchTeam && matchLeague;
    });
  }

  /**
   * SEARCH: simple smart text search
   */
  public searchProducts(products: Product[], query: string): Product[] {
    const q = query.toLowerCase();

    return products.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q) ||
        p.league?.toLowerCase().includes(q)
      );
    });
  }

  /**
   * SORT: basic sorting engine
   */
  public sortProducts(
    products: Product[],
    sortBy: "price_asc" | "price_desc" | "name"
  ): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case "price_asc":
        return sorted.sort((a, b) => a.priceNum - b.priceNum);

      case "price_desc":
        return sorted.sort((a, b) => b.priceNum - a.priceNum);

      case "name":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      default:
        return sorted;
    }
  }

  /**
   * ORGANIZE: Group products by league and team
   */
  public organizeByTeams(products: Product[]): TeamCatalog[] {
    const map = new Map<string, TeamCatalog>();

    for (const product of products) {
      const league = product.league || "Uncategorized League";
      const team = product.team || "General";

      const key = `${league}-${team}`;

      if (!map.has(key)) {
        map.set(key, {
          league,
          team,
          products: [],
        });
      }

      map.get(key)!.products.push(product as any);
    }

    return Array.from(map.values());
  }

  /**
   * Get all unique team names for a given league (or all leagues if not specified)
   */
  public getTeams(products: Product[], league?: string): string[] {
    const teams = new Set<string>();

    products.forEach((p) => {
      if (!league || p.league === league) {
        if (p.team) teams.add(p.team);
      }
    });

    return Array.from(teams);
  }

  /**
   * INVENTORY CHECK
   */
  public isInStock(product: Product): boolean {
    return (product.inventory ?? 1) > 0;
  }

  /**
   * CLEAR CACHE (admin use)
   */
  public clearCache(): void {
    this.cache = {
      data: [],
      lastUpdated: 0,
    };
  }

  /**
   * 🔌 PRINTIFY HOOK
   * Fetches Printify products using paginated endpoints with the NEXT_PUBLIC environment keys.
   */
  private async fetchFromPrintify(): Promise<Product[]> {
    let allProducts: any[] = [];
    let page = 1;
    let hasMore = true;
    const limit = 50;

    try {
      // Retrieve custom Printify credentials if defined in local storage
      const customApiKey = typeof window !== "undefined" ? window.localStorage.getItem("printify_api_key") || "" : "";
      const customShopId = typeof window !== "undefined" ? window.localStorage.getItem("printify_shop_id") || "" : "";

      const headers: Record<string, string> = {};
      if (customApiKey) headers["x-printify-api-key"] = customApiKey;
      if (customShopId) headers["x-printify-shop-id"] = customShopId;

      while (hasMore) {
        // Fetch via the secure server-side proxy which automatically handles credentials and bypasses CORS
        // We use limit=50 (Printify's maximum allowed limit) to fetch large batches, maximizing efficiency and speed
        const res = await fetch(`/api/products?page=${page}&limit=${limit}&t=${Date.now()}`, {
          headers
        });

        if (!res.ok) {
          console.log(`Printify connection returned status ${res.status}.`);
          break;
        }

        const data = await res.json();
        const products = data.products || data.data || [];

        if (!Array.isArray(products) || products.length === 0) {
          hasMore = false;
          break;
        }

        allProducts = [...allProducts, ...products];

        // We stop requesting more pages if:
        // 1. We received fewer products than requested (limit=50), meaning we are on the final page
        // 2. Printify explicitly tells us we've hit or exceeded the 'last_page'
        if (products.length < limit) {
          hasMore = false;
        } else if (data.last_page && page >= data.last_page) {
          hasMore = false;
        }

        page++;
        
        // Safety cap increased to 100 pages to safely load up to 10,000 products
        if (page > 100) {
          break;
        }
      }

      return mapPrintifyProductsToCatalog(allProducts);
    } catch (err: any) {
      console.log("Printify connection is waiting for proper configuration settings:", err?.message || err);
      return [];
    }
  }
}

export default FanCorCommerceEngine.getInstance();
