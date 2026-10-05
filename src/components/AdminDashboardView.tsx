import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Calendar, 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  Database, 
  Terminal,
  LogOut,
  Package,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Shirt,
  Plus,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Grid,
  Sliders,
  Maximize2,
  Lock
} from "lucide-react";
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from "../lib/firebase";
import { signOut } from "firebase/auth";
import FanCorCommerceEngine from "../services/FanCorCommerceEngine";
import { PrintifySetupHelper } from "./PrintifySetupHelper";
import { StripeSetupHelper } from "./StripeSetupHelper";
import { mapPrintifyProductsToCatalog } from "../printifyCatalog";

interface AdminDashboardViewProps {
  adminEmail: string;
  onExit: () => void;
}

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
  source?: string;
}

const DEFAULT_MOCKS: Record<string, string> = {
  "T-Shirts": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
  "Hoodies": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
  "Jerseys": "https://images.unsplash.com/photo-1580087443152-4469eb448166?auto=format&fit=crop&q=80&w=600",
  "Accessories": "https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&q=80&w=600",
};

const LEAGUE_TEAMS: Record<string, string[]> = {
  NBA: [
    "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", 
    "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", 
    "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers", 
    "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat", 
    "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks", 
    "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", 
    "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", 
    "Utah Jazz", "Washington Wizards"
  ],
  NFL: [
    "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", 
    "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", 
    "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers", 
    "Houston Oilers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", 
    "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins", 
    "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", 
    "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers", 
    "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
  ],
  MLB: [
    "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox", 
    "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Guardians", 
    "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals", 
    "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers", 
    "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics", 
    "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants", 
    "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers", 
    "Toronto Blue Jays", "Washington Nationals"
  ],
  NHL: [
    "Anaheim Ducks", "Boston Bruins", "Buffalo Sabres", "Calgary Flames", 
    "Carolina Hurricanes", "Chicago Blackhawks", "Colorado Avalanche", "Columbus Blue Jackets", 
    "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", 
    "Los Angeles Kings", "Minnesota Wild", "Montreal Canadiens", "Nashville Predators", 
    "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", 
    "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "Seattle Kraken", 
    "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Utah Mammoth", 
    "Vancouver Canucks", "Vegas Golden Knights", "Washington Capitals", "Winnipeg Jets"
  ],
  WNBA: [
    "Atlanta Dream", "Chicago Sky", "Connecticut Sun", "Dallas Wings", 
    "Golden State Valkyries", "Indiana Fever", "Las Vegas Aces", "Los Angeles Sparks", 
    "Minnesota Lynx", "New York Liberty", "Phoenix Mercury", "Seattle Storm", "Washington Mystics"
  ],
  MLS: [
    "Atlanta United FC", "Austin FC", "Charlotte FC", "Chicago Fire FC", 
    "FC Cincinnati", "Colorado Rapids", "Columbus Crew", "D.C. United", 
    "FC Dallas", "Houston Dynamo FC", "LA Galaxy", "Los Angeles FC", 
    "Inter Miami CF", "Minnesota United FC", "CF Montréal", "Nashville SC", 
    "New England Revolution", "New York City FC", "New York Red Bulls", 
    "Orlando City SC", "Philadelphia Union", "Portland Timbers", "Real Salt Lake", 
    "San Diego FC", "San Jose Earthquakes", "Seattle Sounders FC", "Sporting Kansas City", 
    "St. Louis City SC", "Toronto FC", "Vancouver Whitecaps FC"
  ],
  Other: [
    "General", "Universal Team"
  ]
};

export default function AdminDashboardView({ adminEmail, onExit }: AdminDashboardViewProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  // Product Creator Form States
  const [printifyId, setPrintifyId] = useState("23199113");
  const [name, setName] = useState("");
  const [collectionVal, setCollectionVal] = useState("NBA");
  const [teamVal, setTeamVal] = useState("");
  const [categoryVal, setCategoryVal] = useState("T-Shirts");
  const [costVal, setCostVal] = useState("");
  const [sellingPriceVal, setSellingPriceVal] = useState("30.00");
  const [comparePriceVal, setComparePriceVal] = useState("45.00");
  const [imageUrl, setImageUrl] = useState("");
  const [activeVal, setActiveVal] = useState(true);
  
  // Real-time design alignment states
  const [designScale, setDesignScale] = useState(55);
  const [verticalOffset, setVerticalOffset] = useState(32);
  const [horizontalOffset, setHorizontalOffset] = useState(50);
  const [showGrid, setShowGrid] = useState(true);
  const [printPosition, setPrintPosition] = useState<"front" | "back" | "pocket">("front");
  
  // Creation status
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // States for dynamic navbar product launcher grid
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Printify product search states
  const [printifySearchQuery, setPrintifySearchQuery] = useState("");
  const [showPrintifySearchDropdown, setShowPrintifySearchDropdown] = useState(false);
  const [livePrintifyEngineProducts, setLivePrintifyEngineProducts] = useState<any[]>([]);
  const [loadingLivePrintify, setLoadingLivePrintify] = useState(false);
  const [livePrintifyError, setLivePrintifyError] = useState<string | null>(null);
  const [printifyPage, setPrintifyPage] = useState(1);

  // Launch Printify league/team prefill filter states
  const [launchPrintifyLeagueFilter, setLaunchPrintifyLeagueFilter] = useState("ALL");
  const [launchPrintifyTeamFilter, setLaunchPrintifyTeamFilter] = useState("ALL");

  const handleLaunchPrintifyLeagueFilterChange = (league: string) => {
    setLaunchPrintifyLeagueFilter(league);
    setLaunchPrintifyTeamFilter("ALL");
  };

  const fetchLivePrintifyEngineProducts = async (page = 1) => {
    setLoadingLivePrintify(true);
    setLivePrintifyError(null);
    try {
      const customApiKey = localStorage.getItem("printify_api_key") || "";
      const customShopId = localStorage.getItem("printify_shop_id") || "";
      const headers: Record<string, string> = {};
      if (customApiKey) headers["x-printify-api-key"] = customApiKey;
      if (customShopId) headers["x-printify-shop-id"] = customShopId;

      const res = await fetch(`/api/products?page=${page}&limit=50&t=${Date.now()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const rawList = data.products || data.data || [];
        if (Array.isArray(rawList)) {
          const mapped = mapPrintifyProductsToCatalog(rawList);
          setLivePrintifyEngineProducts(mapped);
          setPrintifyPage(page);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || data.details || `Error status: ${res.status}`;
        setLivePrintifyError(errMsg);
        console.warn(`Failed to fetch live Printify products directly from the API. Status: ${res.status}`);
      }
    } catch (err: any) {
      setLivePrintifyError(err.message || "Network Error connecting to server");
      console.error("Failed to load live Printify engine products directly:", err);
    } finally {
      setLoadingLivePrintify(false);
    }
  };



  const handleSelectPrintifyOption = (opt: any) => {
    setPrintifyId(opt.id);
    setName(opt.title);
    setCategoryVal(opt.category || "T-Shirts");
    setCostVal(opt.cost ? String(opt.cost) : "11.63");
    setSellingPriceVal("30.00");
    setComparePriceVal("45.00");
    setImageUrl(opt.image || "");
    
    if (opt.league && Object.keys(LEAGUE_TEAMS).includes(opt.league.toUpperCase())) {
      setCollectionVal(opt.league.toUpperCase());
    }
    if (opt.team) {
      setTeamVal(opt.team);
    } else {
      const titleLower = opt.title.toLowerCase();
      let matchedTeam = "";
      const currentLeague = opt.league?.toUpperCase() || collectionVal;
      const teamsInLeague = LEAGUE_TEAMS[currentLeague] || [];
      for (const team of teamsInLeague) {
        if (titleLower.includes(team.toLowerCase())) {
          matchedTeam = team;
          break;
        }
      }
      setTeamVal(matchedTeam);
    }
    
    setPrintifySearchQuery("");
    setShowPrintifySearchDropdown(false);
    showToast(`Loaded Base Tee Design ID: ${opt.id}`);
  };
  const [loadingProds, setLoadingProds] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLeagueFilter, setActiveLeagueFilter] = useState("ALL");
  const [activeTeamFilter, setActiveTeamFilter] = useState("ALL");
  const [activeTypeFilter, setActiveTypeFilter] = useState("ALL");
  const [activeStatusFilter, setActiveStatusFilter] = useState("ALL");
  const [confirmDeleteInventoryId, setConfirmDeleteInventoryId] = useState<string | number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [sandboxHiddenIds, setSandboxHiddenIds] = useState<Set<string>>(new Set());
  const [sandboxDeletedIds, setSandboxDeletedIds] = useState<Set<string>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Get live Printify engine products directly from the Printify API/endpoint
  const allPrintifySearchOptions = livePrintifyEngineProducts.map((p) => ({
    id: String(p.printifyId || p.id),
    title: p.name || p.title,
    category: p.category || "T-Shirts",
    image: p.image || p.imageUrl || DEFAULT_MOCKS[p.category || "T-Shirts"] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
    priceNum: p.priceNum || 30.00,
    cost: p.cost || 11.63,
    league: p.league || "NBA",
    team: p.team || ""
  }));

  // Remove duplicate Printify IDs in our search list
  const uniquePrintifySearchOptions: any[] = Array.from(
    new Map(allPrintifySearchOptions.map((item) => [item.id, item])).values()
  );

  // Find all available teams in the selected league to populate team sub-filter options
  const availableTeamsForSelectedLeague = Array.from(
    new Set(
      uniquePrintifySearchOptions
        .filter((opt) => {
          if (launchPrintifyLeagueFilter === "ALL") return false;
          const optLeague = (opt.league || "").toUpperCase();
          return optLeague === launchPrintifyLeagueFilter.toUpperCase() && opt.team;
        })
        .map((opt) => opt.team)
    )
  ).sort();

  // Filter based on selected league/team for the quick prefill controls
  const filteredUniquePrintifySearchOptions = uniquePrintifySearchOptions.filter((opt) => {
    // League filter matching
    if (launchPrintifyLeagueFilter !== "ALL") {
      const optLeague = (opt.league || "").toUpperCase();
      if (optLeague !== launchPrintifyLeagueFilter.toUpperCase()) {
        return false;
      }
    }
    // Team filter matching
    if (launchPrintifyTeamFilter !== "ALL") {
      const optTeam = (opt.team || "").toLowerCase();
      if (!optTeam.includes(launchPrintifyTeamFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Filter based on printifySearchQuery and selected league/team
  const filteredSearchOptions = filteredUniquePrintifySearchOptions.filter((opt) => {
    const q = printifySearchQuery.toLowerCase();
    return (
      opt.title.toLowerCase().includes(q) ||
      opt.id.toLowerCase().includes(q) ||
      opt.category.toLowerCase().includes(q)
    );
  });

  // Group the filtered search options by league
  const leagueHeaders: Record<string, { label: string; color: string; bg: string; border: string }> = {
    NBA: { label: "🏀 NBA Team Collections", color: "text-[#00D2FF]", bg: "bg-[#00D2FF]/10", border: "border-[#00D2FF]/20" },
    NFL: { label: "🏈 NFL Team Collections", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    WNBA: { label: "🧡 WNBA Team Collections", color: "text-[#FF5C00]", bg: "bg-[#FF5C00]/10", border: "border-[#FF5C00]/20" },
    MLB: { label: "⚾ MLB Team Collections", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    MLS: { label: "⚽ MLS Team Collections", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Other: { label: "👕 Other Collections", color: "text-zinc-400", bg: "bg-zinc-900/50", border: "border-zinc-800" },
  };

  const groupedSearchOptions: Record<string, typeof filteredSearchOptions> = {};
  filteredSearchOptions.forEach((opt) => {
    let league = (opt.league || "Other").toUpperCase();
    if (!["NBA", "NFL", "WNBA", "MLB", "MLS"].includes(league)) {
      league = "Other";
    }
    if (!groupedSearchOptions[league]) {
      groupedSearchOptions[league] = [];
    }
    groupedSearchOptions[league].push(opt);
  });

  const activeGroupedLeagues = ["NBA", "NFL", "WNBA", "MLB", "MLS", "Other"].filter(
    (l) => groupedSearchOptions[l] && groupedSearchOptions[l].length > 0
  );

  // Auto-calculated profit
  const sellingNum = parseFloat(sellingPriceVal) || 0;
  const costNum = parseFloat(costVal) || 0;
  const profitVal = (sellingNum - costNum).toFixed(2);



  const handleCollectionChange = (league: string) => {
    setCollectionVal(league);
    const teams = LEAGUE_TEAMS[league];
    if (teams && teams.length > 0) {
      setTeamVal(teams[0]);
    } else {
      setTeamVal("");
    }
  };

  // Auto preset design coordinates on category change
  useEffect(() => {
    if (categoryVal === "Hoodies") {
      setDesignScale(45);
      setVerticalOffset(38);
      setHorizontalOffset(50);
      setPrintPosition("front");
    } else if (categoryVal === "Jerseys") {
      setDesignScale(60);
      setVerticalOffset(28);
      setHorizontalOffset(50);
      setPrintPosition("front");
    } else if (categoryVal === "Accessories") {
      setDesignScale(35);
      setVerticalOffset(50);
      setHorizontalOffset(50);
      setPrintPosition("front");
    } else {
      // T-Shirts
      setDesignScale(55);
      setVerticalOffset(32);
      setHorizontalOffset(50);
      setPrintPosition("front");
    }
  }, [categoryVal]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsCreating(true);

    if (!name.trim()) {
      setFormError("Product name/title is required.");
      setIsCreating(false);
      return;
    }

    const sellingPriceNum = parseFloat(sellingPriceVal);
    const costPriceNum = parseFloat(costVal);
    const comparePriceNum = parseFloat(comparePriceVal);

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      setFormError("Selling price must be a valid positive number.");
      setIsCreating(false);
      return;
    }

    const finalImage = imageUrl.trim() || DEFAULT_MOCKS[categoryVal] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600";
    const finalPrintifyId = printifyId.trim() || `mock-p-${Date.now()}`;

    try {
      const getProductType = (cat: string, pName: string): "jersey" | "hoodie" | "accessory" | "tee" => {
        const c = cat.toLowerCase();
        const n = pName.toLowerCase();
        if (c.includes("jersey") || n.includes("jersey")) return "jersey";
        if (c.includes("hoodie") || c.includes("sweat") || n.includes("hoodie") || n.includes("sweatshirt")) return "hoodie";
        if (c.includes("accessor") || c.includes("cap") || c.includes("hat") || n.includes("hat") || n.includes("cap") || n.includes("mug")) return "accessory";
        return "tee";
      };

      const type = getProductType(categoryVal, name);

      if (isFirebaseConfigured) {
        // Save to Firestore
        try {
          const { collection, addDoc } = await import("firebase/firestore");
          const docRef = await addDoc(collection(db, "products"), {
            printifyId: finalPrintifyId,
            name: name.trim(),
            title: name.trim(),
            collection: collectionVal,
            team: teamVal.trim(),
            category: categoryVal,
            cost: isNaN(costPriceNum) ? 0 : costPriceNum,
            price: sellingPriceNum,
            comparePrice: isNaN(comparePriceNum) ? 0 : comparePriceNum,
            profit: isNaN(sellingPriceNum - costPriceNum) ? 0 : (sellingPriceNum - costPriceNum),
            active: activeVal,
            image: finalImage,
            type,
            createdAt: new Date(),
            alignment: {
              scale: designScale,
              vertical: verticalOffset,
              horizontal: horizontalOffset,
              position: printPosition
            }
          });

          if (!activeVal) {
            const { doc, setDoc } = await import("firebase/firestore");
            await setDoc(doc(db, "hidden_printify_products", String(docRef.id)), {
              productId: String(docRef.id),
              hiddenAt: new Date().toISOString()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "products");
        }
      } else {
        // Save to Local Storage
        const savedProductsStr = localStorage.getItem("sandbox_added_products") || "[]";
        const sandboxProducts = JSON.parse(savedProductsStr);
        const newProduct = {
          id: `mock-${Date.now()}`,
          printifyId: finalPrintifyId,
          name: name.trim(),
          title: name.trim(),
          collection: collectionVal,
          team: teamVal.trim(),
          category: categoryVal,
          cost: isNaN(costPriceNum) ? 0 : costPriceNum,
          price: sellingPriceNum,
          comparePrice: isNaN(comparePriceNum) ? 0 : comparePriceNum,
          profit: isNaN(sellingPriceNum - costPriceNum) ? 0 : (sellingPriceNum - costPriceNum),
          active: activeVal,
          image: finalImage,
          type,
          createdAt: new Date().toISOString(),
          alignment: {
            scale: designScale,
            vertical: verticalOffset,
            horizontal: horizontalOffset,
            position: printPosition
          }
        };
        sandboxProducts.unshift(newProduct);
        localStorage.setItem("sandbox_added_products", JSON.stringify(sandboxProducts));

        if (!activeVal) {
          const nextHidden = new Set(sandboxHiddenIds);
          nextHidden.add(String(newProduct.id));
          setSandboxHiddenIds(nextHidden);
          localStorage.setItem("sandbox_hidden_product_ids", JSON.stringify(Array.from(nextHidden)));
        }
      }

      // Success
      setFormSuccess("Custom merchandise launched successfully!");
      
      // Clear form
      setPrintifyId("23199113");
      setName("");
      setCostVal("11.63");
      setSellingPriceVal("30.00");
      setComparePriceVal("45.00");
      setImageUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600");
      setActiveVal(true);
      setDesignScale(55);
      setVerticalOffset(32);
      setHorizontalOffset(50);
      setPrintPosition("front");

      // Trigger full UI refreshes
      FanCorCommerceEngine.clearCache();
      setRefreshTrigger(prev => prev + 1);
      window.dispatchEvent(new Event("admin-auth-changed"));
      window.dispatchEvent(new Event("products-synced"));

      // Clear success banner after 4 seconds
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      setFormError(`Launch failed: ${err.message || err}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Sync products states
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSyncProducts = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      FanCorCommerceEngine.clearCache();
      const freshProducts = await FanCorCommerceEngine.getProducts(true);
      setProducts(freshProducts);
      // Trigger update on other components / storefront
      window.dispatchEvent(new Event("admin-auth-changed"));
      window.dispatchEvent(new Event("products-synced"));
      setSyncMessage({ text: "Inventory successfully synchronized with Printify!", type: "success" });
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err: any) {
      setSyncMessage({ text: `Sync failed: ${err.message || err}`, type: "error" });
      setTimeout(() => setSyncMessage(null), 6000);
    } finally {
      setSyncing(false);
    }
  };

  // Load subscribers
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Simulate/mock subscribers for Sandbox mode
      setTimeout(() => {
        const mockSubs: Subscriber[] = [
          {
            id: "sub-1",
            email: "jermaine_prime@gmail.com",
            subscribedAt: { toDate: () => new Date(Date.now() - 3600000 * 2) },
            source: "Newsletter Form Footer"
          },
          {
            id: "sub-2",
            email: "jersey_supporter_99@outlook.com",
            subscribedAt: { toDate: () => new Date(Date.now() - 3600000 * 24) },
            source: "Home Slide Coupon Trigger"
          },
          {
            id: "sub-3",
            email: "championship_fleece@yahoo.com",
            subscribedAt: { toDate: () => new Date(Date.now() - 3600000 * 48) },
            source: "Coach Cor AI chat invitation"
          }
        ];
        setSubscribers(mockSubs);
        setLoadingSubs(false);
      }, 500);
      return;
    }

    // Live Firestore subscribers
    let unsubscribe: any = null;
    const fetchSubscribers = async () => {
      try {
        const { collection, query, orderBy, limit, onSnapshot } = await import("firebase/firestore");
        if (db) {
          const q = query(
            collection(db, "subscribers"), 
            orderBy("subscribedAt", "desc"), 
            limit(15)
          );
          unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(docSnap => ({
              id: docSnap.id,
              ...docSnap.data()
            })) as Subscriber[];
            setSubscribers(list);
            setLoadingSubs(false);
          }, (err) => {
            console.error("Firestore subscribers listening error:", err);
            setLoadingSubs(false);
            handleFirestoreError(err, OperationType.GET, "subscribers");
          });
        }
      } catch (e) {
        console.error("Failed to load Firebase subscribers", e);
        setLoadingSubs(false);
      }
    };

    fetchSubscribers();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch products inside AdminDashboardView
  useEffect(() => {
    // Load local storage states
    const savedHidden = localStorage.getItem("sandbox_hidden_product_ids");
    setSandboxHiddenIds(savedHidden ? new Set(JSON.parse(savedHidden)) : new Set());

    const savedDeleted = localStorage.getItem("sandbox_deleted_product_ids");
    const deletedSet = savedDeleted ? new Set(JSON.parse(savedDeleted)) : new Set();
    setSandboxDeletedIds(deletedSet);

    // Load direct live Printify engine products (not from database/cloud)
    fetchLivePrintifyEngineProducts();

    if (!isFirebaseConfigured) {
      const loadSandbox = async () => {
        setLoadingProds(true);
        const data = await FanCorCommerceEngine.getProducts(true);
        setProducts(data);
        setLoadingProds(false);
      };
      loadSandbox();
      return;
    }

    // Live Firebase Mode
    let unsubHidden: any = null;

    const loadFirebaseData = async () => {
      try {
        const { collection, onSnapshot } = await import("firebase/firestore");
        if (db) {
          // Subscribe to hidden products
          unsubHidden = onSnapshot(collection(db, "hidden_printify_products"), (snapshot) => {
            const ids = new Set(snapshot.docs.map(doc => String(doc.data().productId)));
            setHiddenIds(ids);
          }, (err) => {
            console.error("Firestore hidden products list error:", err);
            handleFirestoreError(err, OperationType.GET, "hidden_printify_products");
          });
        }
        
        setLoadingProds(true);
        const data = await FanCorCommerceEngine.getProducts(true);
        setProducts(data);
        setLoadingProds(false);
      } catch (e) {
        console.error(e);
        setLoadingProds(false);
      }
    };

    loadFirebaseData();

    return () => {
      if (unsubHidden) unsubHidden();
    };
  }, [refreshTrigger]);

  // Listen to the global event to sync with other components
  useEffect(() => {
    const handleSync = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener("admin-auth-changed", handleSync);
    window.addEventListener("products-synced", handleSync);
    return () => {
      window.removeEventListener("admin-auth-changed", handleSync);
      window.removeEventListener("products-synced", handleSync);
    };
  }, []);

  const handleHideProduct = async (productId: string | number) => {
    try {
      FanCorCommerceEngine.clearCache();
      if (!isFirebaseConfigured) {
        const nextHidden = new Set(sandboxHiddenIds);
        nextHidden.add(String(productId));
        setSandboxHiddenIds(nextHidden);
        localStorage.setItem("sandbox_hidden_product_ids", JSON.stringify(Array.from(nextHidden)));
        window.dispatchEvent(new Event("admin-auth-changed"));
        window.dispatchEvent(new Event("products-synced"));
        showToast("Product successfully hidden from storefront.");
        return;
      }

      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "hidden_printify_products", String(productId)), {
        productId: String(productId),
        hiddenAt: new Date().toISOString()
      });
      window.dispatchEvent(new Event("admin-auth-changed"));
      window.dispatchEvent(new Event("products-synced"));
      showToast("Product successfully hidden from storefront.");
    } catch (e) {
      console.error(e);
      showToast("Failed to hide product.", "error");
    }
  };

  const handleShowProduct = async (productId: string | number) => {
    try {
      FanCorCommerceEngine.clearCache();
      if (!isFirebaseConfigured) {
        const nextHidden = new Set(sandboxHiddenIds);
        nextHidden.delete(String(productId));
        setSandboxHiddenIds(nextHidden);
        localStorage.setItem("sandbox_hidden_product_ids", JSON.stringify(Array.from(nextHidden)));
        window.dispatchEvent(new Event("admin-auth-changed"));
        window.dispatchEvent(new Event("products-synced"));
        showToast("Product is now live on storefront.");
        return;
      }

      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "hidden_printify_products", String(productId)));
      window.dispatchEvent(new Event("admin-auth-changed"));
      window.dispatchEvent(new Event("products-synced"));
      showToast("Product is now live on storefront.");
    } catch (e) {
      console.error(e);
      showToast("Failed to make product visible.", "error");
    }
  };

  const handleDeleteProduct = async (product: any) => {
    try {
      FanCorCommerceEngine.clearCache();
      if (!isFirebaseConfigured) {
        const nextDeleted = new Set(sandboxDeletedIds);
        nextDeleted.add(String(product.id));
        setSandboxDeletedIds(nextDeleted);
        localStorage.setItem("sandbox_deleted_product_ids", JSON.stringify(Array.from(nextDeleted)));
        window.dispatchEvent(new Event("admin-auth-changed"));
        window.dispatchEvent(new Event("products-synced"));
        showToast("Product deleted successfully.");
        return;
      }

      if (product.source === "firestore") {
        const { deleteDoc, doc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "products", String(product.id)));
        window.dispatchEvent(new Event("admin-auth-changed"));
        window.dispatchEvent(new Event("products-synced"));
        showToast("Product deleted successfully from database.");
      } else if (product.source === "printify") {
        const customApiKey = localStorage.getItem("printify_api_key") || "";
        const customShopId = localStorage.getItem("printify_shop_id") || "";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customApiKey) headers["x-printify-api-key"] = customApiKey;
        if (customShopId) headers["x-printify-shop-id"] = customShopId;

        const res = await fetch("/api/products", {
          method: "DELETE",
          headers,
          body: JSON.stringify({ productId: product.id })
        });
        if (res.ok) {
          window.dispatchEvent(new Event("admin-auth-changed"));
          window.dispatchEvent(new Event("products-synced"));
          showToast("Product deleted successfully from Printify and storefront.");
        } else {
          // Fallback to hiding if printify delete fails
          await handleHideProduct(product.id);
          showToast("Printify delete failed. Product hidden from storefront instead.", "info");
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to delete product.", "error");
    }
  };

  const handleAdminLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign out failed", err);
      }
    }
    localStorage.removeItem("sandbox_admin_user");
    window.dispatchEvent(new Event("admin-auth-changed"));
    onExit();
  };

  // Helper to get unique teams for the selected league filter
  const getUniqueTeamsForFilter = () => {
    const teamsSet = new Set<string>();
    products.forEach((p) => {
      if (p.team && p.team.trim() !== "") {
        if (activeLeagueFilter === "ALL") {
          teamsSet.add(p.team);
        } else if (activeLeagueFilter === "Other") {
          if (!["NFL", "NBA", "MLB", "NHL", "WNBA", "MLS"].includes(p.league?.toUpperCase() || "")) {
            teamsSet.add(p.team);
          }
        } else if (p.league?.toUpperCase() === activeLeagueFilter.toUpperCase()) {
          teamsSet.add(p.team);
        }
      }
    });
    return Array.from(teamsSet).sort();
  };

  const handleSelectLeagueFilter = (lg: string) => {
    setActiveLeagueFilter(lg);
    setActiveTeamFilter("ALL");
  };

  // Filter products for the navbar launcher grid - include active Printify catalog items and custom merchandise
  const launchedProducts = products.filter((p) => p.source === "printify" || p.source === "firestore" || p.source === "manual");
  let filteredHubProducts = launchedProducts;

  if (activeLeagueFilter !== "ALL") {
    if (activeLeagueFilter === "Other") {
      filteredHubProducts = filteredHubProducts.filter(
        (p) => !["NFL", "NBA", "MLB", "NHL", "WNBA", "MLS"].includes(p.league?.toUpperCase() || "")
      );
    } else {
      filteredHubProducts = filteredHubProducts.filter(
        (p) => p.league?.toUpperCase() === activeLeagueFilter.toUpperCase()
      );
    }
  }

  if (activeTeamFilter !== "ALL") {
    filteredHubProducts = filteredHubProducts.filter(
      (p) => p.team?.toLowerCase() === activeTeamFilter.toLowerCase()
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredHubProducts = filteredHubProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.id?.toString().toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q)
    );
  }

  // Filter products for the Admin Inventory Table
  let filteredInventoryProducts = products;

  if (!isFirebaseConfigured) {
    filteredInventoryProducts = filteredInventoryProducts.filter(
      (p) => !sandboxDeletedIds.has(String(p.id))
    );
  }

  if (activeLeagueFilter !== "ALL") {
    if (activeLeagueFilter === "Other") {
      filteredInventoryProducts = filteredInventoryProducts.filter(
        (p) => !["NFL", "NBA", "MLB", "NHL", "WNBA", "MLS"].includes(p.league?.toUpperCase() || p.collection?.toUpperCase() || "")
      );
    } else {
      filteredInventoryProducts = filteredInventoryProducts.filter(
        (p) => (p.league || p.collection)?.toUpperCase() === activeLeagueFilter.toUpperCase()
      );
    }
  }

  if (activeTeamFilter !== "ALL") {
    filteredInventoryProducts = filteredInventoryProducts.filter(
      (p) => p.team?.toLowerCase() === activeTeamFilter.toLowerCase()
    );
  }

  if (activeTypeFilter !== "ALL") {
    filteredInventoryProducts = filteredInventoryProducts.filter((p) => {
      const type = String(p.category || p.type || "").toLowerCase();
      if (activeTypeFilter === "T-Shirts") {
        return type.includes("tee") || type.includes("shirt");
      }
      if (activeTypeFilter === "Hoodies") {
        return type.includes("hoodie") || type.includes("sweat");
      }
      if (activeTypeFilter === "Jerseys") {
        return type.includes("jersey");
      }
      if (activeTypeFilter === "Accessories") {
        return type.includes("accessor") || type.includes("cap") || type.includes("hat") || type.includes("beanie");
      }
      return true;
    });
  }

  if (activeStatusFilter !== "ALL") {
    filteredInventoryProducts = filteredInventoryProducts.filter((p) => {
      const isProdHidden = isFirebaseConfigured
        ? hiddenIds.has(String(p.id)) || hiddenIds.has(String(p.printifyId))
        : sandboxHiddenIds.has(String(p.id)) || sandboxHiddenIds.has(String(p.printifyId));
      return activeStatusFilter === "hidden" ? isProdHidden : !isProdHidden;
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredInventoryProducts = filteredInventoryProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.id?.toString().toLowerCase().includes(q) ||
        p.printifyId?.toString().toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q)
    );
  }



  return (
    <>
      <PrintifySetupHelper />
      <StripeSetupHelper />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="pt-32 pb-24 px-[5%] max-w-7xl mx-auto space-y-10 text-white font-sans"
      >
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-[#00D2FF] bg-[#00D2FF]/10 px-2.5 py-1 rounded-md border border-[#00D2FF]/20 uppercase">
              ADMIN CONTROL CENTER
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase flex items-center gap-3">
            <LayoutDashboard className="w-9 h-9 text-[#00D2FF]" />
            DASHBOARD PANEL
          </h1>
          <p className="text-zinc-500 text-xs font-medium flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-600" />
            Signed in as: <span className="text-zinc-300 font-bold font-mono">{adminEmail}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sync Products Button */}
          <button
            onClick={handleSyncProducts}
            disabled={syncing}
            className={`font-black text-xs uppercase tracking-widest py-3 px-5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer border ${
              syncing
                ? "bg-zinc-850 text-zinc-500 border-zinc-800 cursor-not-allowed"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Products"}
          </button>

          {/* Reset Storefront Button */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[#00D2FF] hover:text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-amber-400" />
            Reset Storefront
          </button>

          <button
            onClick={onExit}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-2xl transition-all flex items-center gap-2 hover:border-zinc-700 active:scale-98 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Storefront
          </button>
          
          <button
            onClick={handleAdminLogout}
            className="bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 hover:border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-2xl transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </div>

      {/* Sync Status Toast/Banner */}
      <AnimatePresence>
        {syncMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`p-4 rounded-2xl border flex items-center gap-3 shadow-xl ${
              syncMessage.type === "success"
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                : "bg-red-950/20 border-red-500/30 text-red-400"
            }`}
          >
            {syncMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="text-xs font-bold uppercase tracking-wider">
              {syncMessage.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
        {/* Left 2 Columns: Launch Merchandise Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D2FF]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Hub Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00D2FF]/10 text-[#00D2FF] rounded-2xl border border-[#00D2FF]/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black tracking-widest text-[#00D2FF] uppercase font-mono">SUPPORTER INVENTORY DESIGNER</span>
                  <h2 className="text-white text-lg font-black tracking-wider uppercase">LAUNCH NEW MERCHANDISE</h2>
                </div>
              </div>

              <div className="text-[10px] bg-zinc-900/50 border border-zinc-850 px-3 py-1.5 rounded-xl text-[#00D2FF] font-bold uppercase tracking-wider font-mono">
                🔌 DIRECT PRINTIFY ENGINE ACTIVE
              </div>
            </div>

            {/* Form Error or Success notifications */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-950/20 border border-red-900/30 text-red-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </motion.div>
              )}
              {formSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>



            <form onSubmit={handleCreateProduct} className="space-y-6">
              
              {/* Printify Product Teeshirts Search Bar */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 space-y-4 relative">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-[#00D2FF]" />
                    <span className="text-[10px] font-black tracking-widest text-[#00D2FF] uppercase font-mono">
                      QUICK PRINTIFY SEARCH & PREFILL
                    </span>
                    {loadingLivePrintify ? (
                      <span className="flex items-center gap-1 text-[8px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#00D2FF]" />
                        SYNCING ENGINE...
                      </span>
                    ) : livePrintifyEngineProducts.length > 0 ? (
                      <span className="flex items-center gap-1.5 text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ENGINE LIVE ({livePrintifyEngineProducts.length})
                      </span>
                    ) : (
                      <span className="text-[8px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-mono border border-red-500/20">
                        ⚠️ NO REAL INVENTORY DETECTED (PLEASE CHECK SETUP HELPER)
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">
                    Select a base design or tee to auto-populate form
                  </span>
                </div>

                {livePrintifyError && (
                  <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 flex gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wide">Printify API Connection Failed</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {livePrintifyError.includes("401") || livePrintifyError.toLowerCase().includes("unauthenticated")
                          ? "Authentication Error (401). Your Printify API Key is invalid or expired. Use the 'Printify Setup Helper' button on the left to configure a valid API token."
                          : livePrintifyError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Direct dropdown prefill list as requested */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                      Drop Down Menu Printify Prefill ({uniquePrintifySearchOptions.length} Products Found)
                    </label>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 border border-zinc-900 rounded-lg p-1.5">
                      <span className="text-[8px] font-black tracking-wider text-zinc-500 uppercase font-mono px-1">
                        SELECT PAGE:
                      </span>
                      <select
                        value={printifyPage}
                        disabled={loadingLivePrintify}
                        onChange={(e) => fetchLivePrintifyEngineProducts(Number(e.target.value))}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-bold text-zinc-300 font-mono focus:outline-none focus:border-[#00D2FF] cursor-pointer"
                      >
                        <option value={1}>Page 1 (1–50)</option>
                        <option value={2}>Page 2 (51–100)</option>
                        <option value={3}>Page 3 (101–150)</option>
                        <option value={4}>Page 4 (151–200)</option>
                        <option value={5}>Page 5 (201–250)</option>
                        <option value={6}>Page 6 (251–300)</option>
                        <option value={7}>Page 7 (301–350)</option>
                        <option value={8}>Page 8 (351–400)</option>
                        <option value={9}>Page 9 (401–450)</option>
                        <option value={10}>Page 10 (451–500)</option>
                      </select>
                    </div>
                  </div>
                  <select
                    onChange={(e) => {
                      const selected = uniquePrintifySearchOptions.find((opt) => String(opt.id) === e.target.value);
                      if (selected) {
                        handleSelectPrintifyOption(selected);
                      }
                    }}
                    className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-bold cursor-pointer transition-all"
                  >
                    <option value="">-- Click to prefill from real Printify inventory list (Page {printifyPage}) --</option>
                    {uniquePrintifySearchOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.league ? `[${opt.league}] ` : ""}{opt.title} (ID: {opt.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative z-50">
                  <input
                    type="text"
                    placeholder="Or type here to search t-shirts, hoodies, or other Printify products by name or design ID..."
                    value={printifySearchQuery}
                    onChange={(e) => {
                      setPrintifySearchQuery(e.target.value);
                      setShowPrintifySearchDropdown(true);
                    }}
                    onFocus={() => setShowPrintifySearchDropdown(true)}
                    className="w-full bg-black border border-zinc-900 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#00D2FF] font-medium"
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                  
                  {printifySearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrintifySearchQuery("");
                        setShowPrintifySearchDropdown(false);
                      }}
                      className="absolute right-3.5 top-2.5 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md"
                    >
                      Clear
                    </button>
                  )}

                  {/* Dropdown search results */}
                  <AnimatePresence>
                    {showPrintifySearchDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-black border border-zinc-900 rounded-xl p-2.5 shadow-2xl z-50 space-y-3 custom-scrollbar"
                      >
                        {activeGroupedLeagues.length > 0 ? (
                          activeGroupedLeagues.map((leagueKey) => {
                            const groupConfig = leagueHeaders[leagueKey] || leagueHeaders.Other;
                            const items = groupedSearchOptions[leagueKey] || [];
                            return (
                              <div key={leagueKey} className="space-y-1.5">
                                <div className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-black tracking-widest uppercase font-mono border-b border-zinc-900 mt-1 first:mt-0 ${groupConfig.color}`}>
                                  <span>{groupConfig.label}</span>
                                  <span className="text-[8px] bg-zinc-900 px-1.5 py-0.2 rounded-full text-zinc-500 font-bold font-mono">
                                    {items.length}
                                  </span>
                                </div>
                                <div className="space-y-1 pl-0.5">
                                  {items.map((opt) => (
                                    <div
                                      key={opt.id}
                                      onClick={() => handleSelectPrintifyOption(opt)}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/80 transition-all cursor-pointer border border-transparent hover:border-zinc-850 text-left group"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <img
                                          src={opt.image}
                                          alt={opt.title}
                                          referrerPolicy="no-referrer"
                                          className="w-10 h-10 object-contain rounded-md bg-zinc-900 border border-zinc-850 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#00D2FF] transition-colors">
                                            {opt.title}
                                          </h4>
                                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                            {opt.team && (
                                              <span className="text-[8px] font-extrabold bg-[#00D2FF]/10 text-[#00D2FF] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                                🏆 {opt.team}
                                              </span>
                                            )}
                                            <span className="text-[8px] bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 font-mono font-bold">
                                              ID: {opt.id}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right shrink-0 ml-2">
                                        <div className="text-xs font-black text-[#00D2FF]">
                                          ${opt.priceNum.toFixed(2)}
                                        </div>
                                        <div className="text-[8px] text-zinc-500 font-semibold uppercase font-mono tracking-widest mt-0.5">
                                          Prefill
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-6 text-center text-xs text-zinc-600 font-medium font-mono uppercase">
                            No matching products found.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {showPrintifySearchDropdown && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowPrintifySearchDropdown(false)}
                  />
                )}

                {/* Prefill League & Team Filters */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-900">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest font-mono">
                      Filter Catalog Prefills by League & Team
                    </span>
                    {(launchPrintifyLeagueFilter !== "ALL" || launchPrintifyTeamFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setLaunchPrintifyLeagueFilter("ALL");
                          setLaunchPrintifyTeamFilter("ALL");
                        }}
                        className="text-[9px] text-[#00D2FF] hover:underline font-bold uppercase cursor-pointer"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>

                  {/* League Selector Buttons (Exact requested order: ALL, NBA, NFL, WNBA, MLB, MLS) */}
                  <div className="flex flex-wrap gap-1.5">
                    {["ALL", "NBA", "NFL", "WNBA", "MLB", "MLS"].map((league) => {
                      const isActive = launchPrintifyLeagueFilter === league;
                      return (
                        <button
                          key={league}
                          type="button"
                          onClick={() => handleLaunchPrintifyLeagueFilterChange(league)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#00D2FF] text-black shadow-lg shadow-[#00D2FF]/20 font-extrabold"
                              : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-800"
                          }`}
                        >
                          {league}
                        </button>
                      );
                    })}
                  </div>

                  {/* Team Sub-Filter Selector (only shown if a specific league is selected and there are teams available) */}
                  {launchPrintifyLeagueFilter !== "ALL" && availableTeamsForSelectedLeague.length > 0 && (
                    <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-zinc-900 animate-fadeIn">
                      <span className="text-[8px] text-zinc-500 font-black uppercase font-mono tracking-widest">
                        Quick Select {launchPrintifyLeagueFilter} Team:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                        <button
                          type="button"
                          onClick={() => setLaunchPrintifyTeamFilter("ALL")}
                          className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                            launchPrintifyTeamFilter === "ALL"
                              ? "bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30"
                              : "bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          All Teams
                        </button>
                        {availableTeamsForSelectedLeague.map((team) => {
                          const isTeamActive = launchPrintifyTeamFilter === team;
                          return (
                            <button
                              key={team}
                              type="button"
                              onClick={() => setLaunchPrintifyTeamFilter(team)}
                              className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                                isTeamActive
                                  ? "bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30"
                                  : "bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-transparent"
                              }`}
                            >
                              {team}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Horizontal Quick Select Cards Deck */}
                <div className="space-y-2 pt-2.5 border-t border-zinc-900">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest font-mono">
                      Ready-to-Launch Catalog Options ({filteredUniquePrintifySearchOptions.length})
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      Click to auto-load & prefill
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent custom-scrollbar">
                    {filteredUniquePrintifySearchOptions.length > 0 ? (
                      filteredUniquePrintifySearchOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectPrintifyOption(opt)}
                          className={`flex items-center gap-2.5 px-3 py-2 bg-zinc-900/60 hover:bg-[#00D2FF]/10 hover:border-[#00D2FF]/30 border ${
                            printifyId === opt.id ? "border-[#00D2FF] bg-[#00D2FF]/5" : "border-zinc-900"
                          } rounded-xl text-left shrink-0 transition-all cursor-pointer group`}
                          style={{ minWidth: "190px" }}
                        >
                          <img
                            src={opt.image}
                            alt={opt.title}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 object-contain rounded-lg bg-black shrink-0 border border-zinc-850"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black text-white group-hover:text-[#00D2FF] line-clamp-1 truncate uppercase">
                              {opt.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[8px] bg-black/60 px-1 py-0.2 rounded text-[#00D2FF] font-mono font-bold">
                                ID: {opt.id}
                              </span>
                              <span className="text-[8px] text-zinc-400 font-bold">
                                ${opt.priceNum.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-4 text-center text-[10px] text-zinc-500 font-mono uppercase">
                        No {launchPrintifyLeagueFilter} {launchPrintifyTeamFilter !== "ALL" ? `(${launchPrintifyTeamFilter})` : ""} products loaded.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Form Fields (xl:col-span-7) */}
                <div className="xl:col-span-7 space-y-6">


                  {/* Row 1: Name and Printify ID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        CUSTOM MERCHANDISE NAME
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Los Angeles Lakers Championship Hoodie"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#00D2FF] font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1">
                        PRINTIFY DESIGN ID <Lock className="w-3 h-3 text-amber-500" />
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={printifyId}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-400 font-mono font-bold cursor-not-allowed select-none"
                        />
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: League, Team, and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        TARGET LEAGUE
                      </label>
                      <select
                        value={collectionVal}
                        onChange={(e) => handleCollectionChange(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-bold cursor-pointer transition-all"
                      >
                        {Object.keys(LEAGUE_TEAMS).map((league) => (
                          <option key={league} value={league}>
                            {league}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        TARGET TEAM
                      </label>
                      <select
                        value={teamVal}
                        onChange={(e) => setTeamVal(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-bold cursor-pointer transition-all"
                      >
                        <option value="">Select Target Team</option>
                        {LEAGUE_TEAMS[collectionVal]?.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        PRODUCT CATEGORY
                      </label>
                      <select
                        value={categoryVal}
                        onChange={(e) => setCategoryVal(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-bold cursor-pointer transition-all"
                      >
                        {Object.keys(DEFAULT_MOCKS).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Image URL and Active State */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        IMAGE MOCKUP URL (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave empty for category default high-res fallback mockup"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#00D2FF] font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-black border border-zinc-900 p-3 rounded-xl">
                      <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        IMMEDIATELY LIVE
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveVal(!activeVal)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          activeVal ? "bg-[#00D2FF]" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                            activeVal ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Row 4: Financial Projections & Margin Indicator */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-black/40 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
                    <div className="space-y-2">
                      <label className="block text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                        BASE PRODUCTION COST ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="11.63"
                        value={costVal}
                        onChange={(e) => setCostVal(e.target.value)}
                        className="w-full bg-black border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                        COMPARE-AT RETAIL ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="45.00"
                        value={comparePriceVal}
                        onChange={(e) => setComparePriceVal(e.target.value)}
                        className="w-full bg-black border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] text-zinc-500 font-black uppercase tracking-widest text-[#00D2FF]">
                        SELLING RETAIL PRICE ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="30.00"
                        value={sellingPriceVal}
                        onChange={(e) => setSellingPriceVal(e.target.value)}
                        className="w-full bg-black border border-[#00D2FF]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D2FF] font-mono font-bold"
                      />
                    </div>

                    <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-zinc-900 mt-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="block text-[8px] text-zinc-500 font-black uppercase tracking-widest">
                            PROJECTED PROFIT MARGIN
                          </span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            +${profitVal} USD Per Sale
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        {(parseFloat(comparePriceVal) || 0) > (parseFloat(sellingPriceVal) || 0) ? (
                          <span>
                            🔥 Discounted Price: Saving fans{" "}
                            <span className="text-zinc-300 font-mono font-bold">
                              ${((parseFloat(comparePriceVal) || 0) - (parseFloat(sellingPriceVal) || 0)).toFixed(2)}
                            </span>
                          </span>
                        ) : (
                          <span>Optimized Retail Price Structure</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Submission Action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className={`w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                        isCreating
                          ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
                          : "bg-[#00D2FF] text-zinc-950 hover:bg-[#33e0ff] active:scale-98"
                      }`}
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Launching To Fan Archive...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Launch Custom Merchandise Design
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Side: Live Mockup Alignment Studio (xl:col-span-5) */}
                <div className="xl:col-span-5 bg-black/40 border border-zinc-900 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Studio Header */}
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#00D2FF]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          ALIGNMENT LAB
                        </span>
                      </div>
                      
                      {/* Grid Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowGrid(!showGrid)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                          showGrid 
                            ? "bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30" 
                            : "bg-zinc-900 text-zinc-500 border border-zinc-850"
                        }`}
                      >
                        <Grid className="w-3 h-3" />
                        {showGrid ? "GRID ON" : "GRID OFF"}
                      </button>
                    </div>

                    {/* Interactive Mockup Canvas */}
                    <div className="relative aspect-square w-full bg-[#111] border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center p-6 shadow-inner select-none">
                      {/* Grid overlay */}
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-6 opacity-35 z-20">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-cyan-500/10 flex items-center justify-center">
                              {i === 14 && <div className="w-1 h-1 rounded-full bg-cyan-400/40" />}
                              {i === 15 && <div className="w-1 h-1 rounded-full bg-cyan-400/40" />}
                              {i === 20 && <div className="w-1 h-1 rounded-full bg-cyan-400/40" />}
                              {i === 21 && <div className="w-1 h-1 rounded-full bg-cyan-400/40" />}
                            </div>
                          ))}
                          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#00D2FF]/20 -translate-y-1/2" />
                          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#00D2FF]/20 -translate-x-1/2" />
                        </div>
                      )}

                      {/* Mockup Base Image */}
                      <img
                        src={imageUrl.trim() || DEFAULT_MOCKS[categoryVal] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600"}
                        alt="Product Mockup Base"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain pointer-events-none select-none relative z-10 animate-fade-in"
                      />

                      {/* Floating Design Align Area Overlay */}
                      <div
                        className="absolute border border-dashed border-[#00D2FF] bg-[#00D2FF]/10 backdrop-blur-[0.5px] rounded p-1 flex flex-col items-center justify-center text-center pointer-events-none z-20 transition-all duration-75 shadow-lg"
                        style={{
                          width: `${designScale}%`,
                          height: `${designScale * 0.7}%`,
                          top: `${verticalOffset}%`,
                          left: `${horizontalOffset}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {/* Area Tag */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00D2FF] text-zinc-950 text-[7px] font-black px-1 rounded uppercase tracking-wider whitespace-nowrap leading-none shadow">
                          PRINT PREVIEW
                        </div>

                        {/* Interactive Dynamic Text / Team Badge mockup inside */}
                        <div className="w-full flex flex-col items-center justify-center p-0.5 pointer-events-none">
                          {teamVal && (
                            <span className="text-[11px] font-anton text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-center max-w-full truncate">
                              {teamVal.toUpperCase()}
                            </span>
                          )}
                          <span className="text-[8px] font-mono font-black text-cyan-200 uppercase tracking-widest text-center mt-0.5 line-clamp-1 max-w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {name ? name.toUpperCase() : "CUSTOM APPAREL"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Presets Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDesignScale(55);
                          setVerticalOffset(32);
                          setHorizontalOffset(50);
                        }}
                        className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-[9px] py-1.5 rounded-lg border border-zinc-850 font-black uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Full Chest
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDesignScale(25);
                          setVerticalOffset(28);
                          setHorizontalOffset(38);
                        }}
                        className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-[9px] py-1.5 rounded-lg border border-zinc-850 font-black uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Pocket Left
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDesignScale(70);
                          setVerticalOffset(42);
                          setHorizontalOffset(50);
                        }}
                        className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-[9px] py-1.5 rounded-lg border border-zinc-850 font-black uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Large Back
                      </button>
                    </div>
                  </div>

                  {/* Range Sliders Controls */}
                  <div className="space-y-4 bg-black/50 border border-zinc-900 p-4 rounded-xl">
                    <span className="block text-[8px] text-zinc-500 font-extrabold uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2">
                      ALIGNMENT CONTROLLER VALUES
                    </span>
                    
                    {/* Scale Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-zinc-400 uppercase tracking-wider">PRINT SCALE</span>
                        <span className="text-[#00D2FF] font-mono font-black">{designScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        value={designScale}
                        onChange={(e) => setDesignScale(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-[#00D2FF]"
                      />
                    </div>

                    {/* Vertical Position Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-zinc-400 uppercase tracking-wider">VERTICAL SHIFT (Y)</span>
                        <span className="text-[#00D2FF] font-mono font-black">{verticalOffset}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="85"
                        value={verticalOffset}
                        onChange={(e) => setVerticalOffset(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-[#00D2FF]"
                      />
                    </div>

                    {/* Horizontal Position Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-zinc-400 uppercase tracking-wider">HORIZONTAL SHIFT (X)</span>
                        <span className="text-[#00D2FF] font-mono font-black">{horizontalOffset}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={horizontalOffset}
                        onChange={(e) => setHorizontalOffset(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-[#00D2FF]"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Subscribers Tracker */}
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D2FF]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
            <div className="p-2.5 bg-[#00D2FF]/10 text-[#00D2FF] rounded-2xl border border-[#00D2FF]/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-[#00D2FF] uppercase">ENGAGEMENT ENGINE</span>
              <h2 className="text-white text-lg font-black tracking-wider uppercase">NEWSLETTER SUBSCRIBERS</h2>
            </div>
          </div>

          <div className="space-y-4">
            {loadingSubs ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00D2FF]"></div>
              </div>
            ) : subscribers.length > 0 ? (
              <div className="space-y-3">
                {subscribers.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="p-4 bg-black border border-zinc-900 rounded-2xl flex flex-col gap-2 hover:border-zinc-850 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[#00D2FF]">
                      <Mail className="w-4 h-4 shrink-0 text-[#00D2FF]/85" />
                      <span className="text-xs font-black truncate text-zinc-200 select-all font-mono">{sub.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        <span>
                          {sub.subscribedAt?.toDate 
                            ? sub.subscribedAt.toDate().toLocaleDateString() 
                            : "Just now"}
                        </span>
                      </div>
                      <span className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded text-[9px] tracking-normal font-medium normal-case">
                        {sub.source || "Web Portal"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-zinc-900 rounded-2xl text-zinc-600 uppercase font-black tracking-widest text-xs">
                No active subscribers found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INVENTORY DIRECTORY & MANAGEMENT CENTER */}
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left mt-10">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#4fc3f7]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#4fc3f7]/10 text-[#4fc3f7] rounded-2xl border border-[#4fc3f7]/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-[#4fc3f7] uppercase">STOREFRONT DATABASE</span>
              <h2 className="text-white text-xl font-black tracking-wider uppercase">Inventory Directory & Controls</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-[220px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 text-white border border-zinc-850 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-[#4fc3f7] w-full"
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={() => {
                setRefreshTrigger((prev) => prev + 1);
                showToast("Reloaded inventory database from servers.", "success");
              }}
              className="p-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer text-zinc-400 hover:text-[#4fc3f7]"
              title="Reload Inventory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-black/30 p-4 rounded-2xl border border-zinc-900">
          {/* League Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">League</label>
            <select
              value={activeLeagueFilter}
              onChange={(e) => handleSelectLeagueFilter(e.target.value)}
              className="bg-[#050505] text-xs text-white border border-zinc-850 px-3 py-2 rounded-xl focus:outline-none focus:border-[#4fc3f7] cursor-pointer"
            >
              <option value="ALL">ALL LEAGUES</option>
              <option value="NBA">NBA</option>
              <option value="NFL">NFL</option>
              <option value="MLB">MLB</option>
              <option value="MLS">MLS</option>
              <option value="WNBA">WNBA</option>
              <option value="NHL">NHL</option>
              <option value="Other">OTHER/COLLECTIONS</option>
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Team</label>
            <select
              value={activeTeamFilter}
              onChange={(e) => setActiveTeamFilter(e.target.value)}
              className="bg-[#050505] text-xs text-white border border-zinc-850 px-3 py-2 rounded-xl focus:outline-none focus:border-[#4fc3f7] cursor-pointer"
            >
              <option value="ALL">ALL TEAMS</option>
              {activeLeagueFilter !== "ALL" ? (
                (LEAGUE_TEAMS[activeLeagueFilter] || []).map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))
              ) : (
                Object.values(LEAGUE_TEAMS).flat().map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))
              )}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
            <select
              value={activeTypeFilter}
              onChange={(e) => setActiveTypeFilter(e.target.value)}
              className="bg-[#050505] text-xs text-white border border-zinc-850 px-3 py-2 rounded-xl focus:outline-none focus:border-[#4fc3f7] cursor-pointer"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="T-Shirts">T-SHIRTS / TEES</option>
              <option value="Hoodies">HOODIES & SWEATSHIRTS</option>
              <option value="Jerseys">JERSEYS</option>
              <option value="Accessories">ACCESSORIES & HATS</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Storefront Status</label>
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="bg-[#050505] text-xs text-white border border-zinc-850 px-3 py-2 rounded-xl focus:outline-none focus:border-[#4fc3f7] cursor-pointer"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="visible">LIVE / VISIBLE</option>
              <option value="hidden">HIDDEN FROM CUSTOMERS</option>
            </select>
          </div>
        </div>

        {/* Products list */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {loadingProds ? (
            <div className="py-20 text-center flex flex-col justify-center items-center gap-4 text-zinc-400">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#4fc3f7] border-t-transparent"></div>
              <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Scanning Inventory...</p>
            </div>
          ) : filteredInventoryProducts.length > 0 ? (
            <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-2xl bg-black/20 overflow-hidden">
              {filteredInventoryProducts.map((p) => {
                const isProdHidden = isFirebaseConfigured
                  ? hiddenIds.has(String(p.id)) || hiddenIds.has(String(p.printifyId))
                  : sandboxHiddenIds.has(String(p.id)) || sandboxHiddenIds.has(String(p.printifyId));

                // Format category
                const categoryName = p.category || p.type || "apparel";
                const isTee = categoryName.toLowerCase().includes("tee") || categoryName.toLowerCase().includes("shirt");
                const isHoodie = categoryName.toLowerCase().includes("hoodie") || categoryName.toLowerCase().includes("sweat");
                const isJersey = categoryName.toLowerCase().includes("jersey");
                const isAccessory = categoryName.toLowerCase().includes("accessor") || categoryName.toLowerCase().includes("cap") || categoryName.toLowerCase().includes("hat");

                let categoryTag = "T-Shirt";
                if (isHoodie) categoryTag = "Hoodie";
                else if (isJersey) categoryTag = "Jersey";
                else if (isAccessory) categoryTag = "Accessory";

                // Price parsing
                const priceNum = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 29.99;
                const costNum = parseFloat(p.cost) || 12.50;
                const profit = priceNum - costNum;

                return (
                  <div 
                    key={p.id} 
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-all"
                  >
                    {/* Product Meta & Image */}
                    <div className="flex items-center gap-4 max-w-lg min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img 
                          src={p.image || p.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200"} 
                          alt={p.name || p.title} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono border border-white/5 text-zinc-400">
                          {p.source === "printify" ? "Printify" : "Sandbox"}
                        </div>
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[9px] font-black tracking-widest text-[#4fc3f7] bg-[#4fc3f7]/10 px-2 py-0.5 rounded border border-[#4fc3f7]/15 uppercase">
                            {categoryTag}
                          </span>
                          {p.team && (
                            <span className="text-[9px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded">
                              {p.team.toUpperCase()}
                            </span>
                          )}
                          {(p.league || p.collection) && (
                            <span className="text-[9px] font-mono text-zinc-500">
                              {(p.league || p.collection).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-white text-sm font-bold truncate leading-tight select-all font-sans">
                          {p.name || p.title}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 select-all truncate">
                          ID: {p.id}
                        </p>
                      </div>
                    </div>

                    {/* Financials & Status & Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Financial metrics */}
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Financials</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div>
                            <span className="text-zinc-500 text-[9px] block">Price</span>
                            <span className="text-white text-xs font-bold font-mono">${priceNum.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">Cost</span>
                            <span className="text-zinc-400 text-xs font-mono">${costNum.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[#00e676]/70 text-[9px] block">Profit</span>
                            <span className="text-[#00e676] text-xs font-bold font-mono">+${profit.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isProdHidden ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            HIDDEN FROM SITE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            LIVE ON SITE
                          </span>
                        )}
                      </div>

                      {/* Action controls */}
                      <div className="flex items-center gap-2">
                        {/* Hide/Show toggle button */}
                        {isProdHidden ? (
                          <button
                            onClick={() => handleShowProduct(p.id)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all cursor-pointer uppercase tracking-wider font-sans"
                          >
                            Show
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHideProduct(p.id)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all cursor-pointer uppercase tracking-wider font-sans"
                          >
                            Hide
                          </button>
                        )}

                        {/* Delete button with safety verification */}
                        {confirmDeleteInventoryId === p.id ? (
                          <div className="flex items-center gap-1.5 font-sans">
                            <button
                              onClick={() => {
                                handleDeleteProduct(p);
                                setConfirmDeleteInventoryId(null);
                              }}
                              className="px-2.5 py-1.5 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                            >
                              CONFIRM
                            </button>
                            <button
                              onClick={() => setConfirmDeleteInventoryId(null)}
                              className="px-2 py-1.5 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteInventoryId(p.id)}
                            className="p-1.5 bg-zinc-900 border border-zinc-850 hover:bg-rose-950/30 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-zinc-900 rounded-2xl text-zinc-600 uppercase font-black tracking-widest text-xs">
              No inventory products found matching selected filters
            </div>
          )}
        </div>
      </div>

      {/* FLOATING ADMINISTRATIVE TOASTS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[10000] border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-sans ${
              toast.type === "error" 
                ? "bg-rose-950 border-rose-500/20 text-rose-200" 
                : toast.type === "info"
                ? "bg-zinc-900 border-zinc-800 text-white"
                : "bg-emerald-950 border-emerald-500/20 text-emerald-200"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${
              toast.type === "error" 
                ? "bg-rose-500/10 text-rose-400" 
                : toast.type === "info"
                ? "bg-zinc-800 text-zinc-300"
                : "bg-emerald-500/10 text-emerald-400"
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-tight">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
