import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Trophy, 
  MessageSquare, 
  ChevronDown, 
  Sparkles, 
  Award, 
  Tag, 
  Flame, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Search,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Logo } from "./Logo";

interface NavbarProps {
  cartCount: number;
  activeLeague: string;
  setActiveLeague: (league: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeTeam: string | null;
  setActiveTeam: (team: string | null) => void;
  activeKeyword: string | null;
  setActiveKeyword: (keyword: string | null) => void;
  onCartOpen: () => void;
  onChatOpen: () => void;
  onLoginOpen: () => void;
  onAboutOpen?: () => void;
  onContactOpen?: () => void;
  onFanStandOpen?: () => void;
  adminEmail?: string | null;
  currentView?: "storefront" | "admin";
  onViewChange?: (view: "storefront" | "admin") => void;
}

// Structured data configuration for the mega dropdown lists grouped by divisions/conferences
export const LEAGUE_DROP_DATA = {
  NBA: {
    color: "from-purple-600/30 via-fuchsia-500/20 to-yellow-600/30",
    motto: "32 HARDWOOD CLASSICS & SWINGMAN JERSEY LABS",
    width: "w-[1080px]",
    align: "left-[-230px]",
    divisions: [
      {
        name: "ATLANTIC",
        teams: ["Boston Celtics", "Brooklyn Nets", "New York Knicks", "Philadelphia 76ers", "Toronto Raptors"]
      },
      {
        name: "CENTRAL",
        teams: ["Chicago Bulls", "Cleveland Cavaliers", "Detroit Pistons", "Indiana Pacers", "Milwaukee Bucks"]
      },
      {
        name: "SOUTHEAST",
        teams: ["Atlanta Hawks", "Charlotte Hornets", "Miami Heat", "Orlando Magic", "Washington Wizards"]
      },
      {
        name: "NORTHWEST",
        teams: ["Denver Nuggets", "Minnesota Timberwolves", "Oklahoma City Thunder", "Portland Trail Blazers", "Utah Jazz"]
      },
      {
        name: "PACIFIC",
        teams: ["Golden State Warriors", "Los Angeles Clippers", "Los Angeles Lakers", "Phoenix Suns", "Sacramento Kings"]
      },
      {
        name: "SOUTHWEST",
        teams: ["Dallas Mavericks", "Houston Rockets", "Memphis Grizzlies", "New Orleans Pelicans", "San Antonio Spurs"]
      }
    ]
  },
  NFL: {
    color: "from-blue-600/30 via-[#00D2FF]/20 to-red-600/30",
    motto: "32 GRIDIRON GLORIES & TAILGATE FAVS",
    width: "w-[1080px]",
    align: "left-[-230px]",
    divisions: [
      {
        name: "AFC EAST",
        teams: ["Buffalo Bills", "Miami Dolphins", "New England Patriots", "New York Jets"]
      },
      {
        name: "AFC NORTH",
        teams: ["Baltimore Ravens", "Cincinnati Bengals", "Cleveland Browns", "Pittsburgh Steelers"]
      },
      {
        name: "AFC SOUTH",
        teams: ["Houston Oilers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Tennessee Titans"]
      },
      {
        name: "AFC WEST",
        teams: ["Denver Broncos", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers"]
      },
      {
        name: "NFC EAST",
        teams: ["Dallas Cowboys", "New York Giants", "Philadelphia Eagles", "Washington Commanders"]
      },
      {
        name: "NFC NORTH",
        teams: ["Chicago Bears", "Detroit Lions", "Green Bay Packers", "Minnesota Vikings"]
      },
      {
        name: "NFC SOUTH",
        teams: ["Atlanta Falcons", "Carolina Panthers", "New Orleans Saints", "Tampa Bay Buccaneers"]
      },
      {
        name: "NFC WEST",
        teams: ["Arizona Cardinals", "Los Angeles Rams", "San Francisco 49ers", "Seattle Seahawks"]
      }
    ]
  },
  MLB: {
    color: "from-emerald-600/30 via-teal-500/20 to-blue-600/30",
    motto: "32 TRADITIONAL PINSTRIPES & VINTAGE DIAMOND GEAR",
    width: "w-[1080px]",
    align: "left-[-230px]",
    divisions: [
      {
        name: "AL EAST",
        teams: ["Baltimore Orioles", "Boston Red Sox", "New York Yankees", "Tampa Bay Rays", "Toronto Blue Jays"]
      },
      {
        name: "AL CENTRAL",
        teams: ["Chicago White Sox", "Cleveland Guardians", "Detroit Tigers", "Kansas City Royals", "Minnesota Twins"]
      },
      {
        name: "AL WEST",
        teams: ["Houston Astros", "Los Angeles Angels", "Oakland Athletics", "Seattle Mariners", "Texas Rangers"]
      },
      {
        name: "NL EAST",
        teams: ["Atlanta Braves", "Miami Marlins", "Montreal Expos", "New York Mets", "Philadelphia Phillies", "Washington Nationals"]
      },
      {
        name: "NL CENTRAL",
        teams: ["Chicago Cubs", "Cincinnati Reds", "Milwaukee Brewers", "Pittsburgh Pirates", "St. Louis Cardinals"]
      },
      {
        name: "NL WEST",
        teams: ["Arizona Diamondbacks", "Colorado Rockies", "Los Angeles Dodgers", "Portland Pioneers", "San Diego Padres", "San Francisco Giants"]
      }
    ]
  },
  MLS: {
    color: "from-teal-600/30 via-emerald-500/20 to-emerald-800/30",
    motto: "32 PITCH-GRADE EMBLEMS & MATCHDAY INSIGNIAS",
    width: "w-[880px]",
    align: "right-[-30px]",
    divisions: [
      {
        name: "EASTERN CONFERENCE",
        teams: ["Atlanta United FC", "Charlotte FC", "Chicago Fire FC", "FC Cincinnati", "Columbus Crew", "D.C. United", "Inter Miami CF", "CF Montréal", "Nashville SC", "New England Revolution", "New York City FC", "New York Red Bulls", "Orlando City SC", "Philadelphia Union", "Toronto FC"]
      },
      {
        name: "WESTERN CONFERENCE",
        teams: ["Austin FC", "Colorado Rapids", "FC Dallas", "Houston Dynamo FC", "Sporting Kansas City", "LA Galaxy", "Los Angeles FC", "Minnesota United FC", "Portland Timbers", "Real Salt Lake", "San Diego FC", "San Jose Earthquakes", "Seattle Sounders FC", "St. Louis City SC", "Vancouver Whitecaps FC"]
      }
    ]
  },
  WNBA: {
    color: "from-orange-600/30 via-red-500/20 to-amber-600/30",
    motto: "13 ELITE LEADERBOARDS & OFF-COURT EMPOWERMENT",
    width: "w-[800px]",
    align: "left-[-50px]",
    divisions: [
      {
        name: "EASTERN CONFERENCE",
        teams: ["Atlanta Dream", "Chicago Sky", "Connecticut Sun", "Indiana Fever", "New York Liberty", "Washington Mystics"]
      },
      {
        name: "WESTERN CONFERENCE",
        teams: ["Dallas Wings", "Golden State Valkyries", "Las Vegas Aces", "Los Angeles Sparks", "Minnesota Lynx", "Phoenix Mercury", "Seattle Storm"]
      }
    ]
  },
  NHL: {
    color: "from-cyan-600/30 via-[#00D2FF]/20 to-blue-800/30",
    motto: "32 ICE WARRIORS & INSULATED ARENA APPAREL",
    width: "w-[1080px]",
    align: "right-[-120px]",
    divisions: [
      {
        name: "METROPOLITAN",
        teams: ["Carolina Hurricanes", "Columbus Blue Jackets", "New Jersey Devils", "New York Islanders", "New York Rangers", "Philadelphia Flyers", "Pittsburgh Penguins", "Washington Capitals"]
      },
      {
        name: "ATLANTIC",
        teams: ["Boston Bruins", "Buffalo Sabres", "Detroit Red Wings", "Florida Panthers", "Montreal Canadiens", "Ottawa Senators", "Tampa Bay Lightning", "Toronto Maple Leafs"]
      },
      {
        name: "CENTRAL",
        teams: ["Chicago Blackhawks", "Colorado Avalanche", "Dallas Stars", "Minnesota Wild", "Nashville Predators", "St. Louis Blues", "Utah Mammoth", "Winnipeg Jets"]
      },
      {
        name: "PACIFIC",
        teams: ["Anaheim Ducks", "Calgary Flames", "Edmonton Oilers", "Los Angeles Kings", "San Jose Sharks", "Seattle Kraken", "Vancouver Canucks", "Vegas Golden Knights"]
      }
    ]
  }
};

const APPAREL_ITEMS = [
  { name: "Jerseys Collection", keyword: "Jersey" },
  { name: "Game-Day Hoodies", keyword: "Hoodie" },
  { name: "Ringspun T-Shirts", keyword: "T-Shirt" },
  { name: "Stadium Accessories", keyword: "Accessories" }
];

const HATS_ITEMS = [
  { name: "Retro Snapbacks", keyword: "Snapback" },
  { name: "Pro Curved Caps", keyword: "Cap" },
  { name: "Rib-Knit Beanies", keyword: "Beanie" }
];

const HOODIES_ITEMS = [
  { name: "Heavyweight Hoodies", keyword: "Heavyweight" },
  { name: "Fleece Hoodies", keyword: "Fleece" },
  { name: "Pullover Hoodies", keyword: "Pullover" },
  { name: "Cropped Hoodies", keyword: "Crop" }
];

const JACKETS_ITEMS = [
  { name: "Warmup Jackets", keyword: "Warmup" },
  { name: "Windbreakers", keyword: "Windbreaker" },
  { name: "Varsity Jackets", keyword: "Varsity" }
];

const QUICK_COLLECTIONS = [
  { label: "⚡ ALL GEAR", type: "league", value: "ALL" },
  { label: "🏀 NBA Basketball", type: "league", value: "NBA" },
  { label: "🏈 NFL Football", type: "league", value: "NFL" },
  { label: "⚾ MLB Baseball", type: "league", value: "MLB" },
  { label: "⚽ MLS Soccer", type: "league", value: "MLS" },
  { label: "🏀 WNBA Women", type: "league", value: "WNBA" },
  { label: "🏒 NHL Hockey", type: "league", value: "NHL" }
];

export default function Navbar({
  cartCount,
  activeLeague,
  setActiveLeague,
  activeCategory,
  setActiveCategory,
  activeTeam,
  setActiveTeam,
  activeKeyword,
  setActiveKeyword,
  onCartOpen,
  onChatOpen,
  onLoginOpen,
  onAboutOpen,
  onContactOpen,
  onFanStandOpen,
  adminEmail,
  currentView,
  onViewChange
}: NavbarProps) {
  
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollCollections = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleMenuHover = (menu: string | null) => {
    setHoveredMenu(menu);
    setSearchTerm(""); // Reset search term when hover shifts
  };

  const handleScrollToCatalog = () => {
    const element = document.getElementById("shop-by-collection");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToFanStand = () => {
    if (onFanStandOpen) {
      onFanStandOpen();
    } else {
      const element = document.getElementById("fan-stand");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveLeague("ALL");
    setActiveCategory("ALL");
    setActiveTeam(null);
    setActiveKeyword(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTeam = (league: string, team: string) => {
    setActiveLeague(league);
    setActiveCategory("ALL");
    setActiveTeam(team);
    setActiveKeyword(null);
    setHoveredMenu(null);
    handleScrollToCatalog();
  };

  const handleSelectKeyword = (keyword: string) => {
    setActiveLeague("ALL");
    setActiveCategory("ALL");
    setActiveTeam(null);
    setActiveKeyword(keyword);
    setHoveredMenu(null);
    handleScrollToCatalog();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#020408]/95 backdrop-blur-md border-b border-zinc-900/90 pt-5 pb-4 px-6 md:px-16 select-none transition-all duration-300">
      <div className="w-full flex items-center justify-between relative">
        
        {/* Brand logo positioned to the FAR LEFT */}
        <div 
          onClick={handleHomeClick}
          className="cursor-pointer group shrink-0 mr-10"
        >
          <Logo variant="dark" />
        </div>

        {/* Desktop Navigation Links - BIGGER and edge aligned */}
        <nav className="hidden xl:flex items-center gap-6.5 text-[13px] font-extrabold tracking-widest text-zinc-400 mr-auto">
          <a 
            href="#" 
            onClick={handleHomeClick} 
            className="hover:text-white transition-colors"
          >
            HOME
          </a>

          {adminEmail ? (
            <a 
              href="#admin" 
              onClick={(e) => {
                e.preventDefault();
                if (onViewChange) {
                  onViewChange(currentView === "admin" ? "storefront" : "admin");
                }
              }}
              className="text-[#00D2FF] hover:text-[#00D2FF]/80 transition-colors font-black"
            >
              {currentView === "admin" ? "STOREFRONT" : "ADMIN PANEL"}
            </a>
          ) : (
            <a 
              href="#login" 
              onClick={(e) => {
                e.preventDefault();
                onLoginOpen();
              }}
              className="hover:text-white transition-colors"
            >
              LOGIN
            </a>
          )}

          <a 
            href="#about" 
            onClick={(e) => {
              e.preventDefault();
              if (onAboutOpen) onAboutOpen();
            }}
            className="hover:text-white transition-colors"
          >
            ABOUT
          </a>

          {/* Small bag/cart icon in navigation stream */}
          <button 
            onClick={onCartOpen}
            className="text-zinc-400 hover:text-[#00D2FF] transition-colors relative p-1.5 cursor-pointer flex items-center"
            title="Open Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#00D2FF] rounded-full animate-pulse"></span>
            )}
          </button>

          {/* LEAGUE DROPDOWNS: NFL, NBA, WNBA, MLB, NHL, MLS */}
          {(Object.keys(LEAGUE_DROP_DATA) as Array<keyof typeof LEAGUE_DROP_DATA>).map((lg) => {
            const data = LEAGUE_DROP_DATA[lg];
            const isHovered = hoveredMenu === lg;

            // Flatten divisions to get all teams for general search/counting
            const allTeams = data.divisions.flatMap((d) => d.teams);

            // Normalize search strings to remove dots, dashes and extra spaces
            const normalizeSearch = (str: string) => 
              str.toLowerCase()
                .replace(/\./g, "")
                .replace(/-/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            // Filter teams inside dropdown search bar
            const filteredTeams = allTeams.filter(team => 
              normalizeSearch(team).includes(normalizeSearch(searchTerm))
            );

            return (
              <div
                key={lg}
                onMouseEnter={() => handleMenuHover(lg)}
                onMouseLeave={() => handleMenuHover(null)}
                className="relative py-3"
              >
                <button
                  onClick={() => {
                    setActiveLeague(lg);
                    setActiveCategory("ALL");
                    setActiveTeam(null);
                    setActiveKeyword(null);
                    handleScrollToCatalog();
                  }}
                  className={`transition-all flex items-center gap-1.5 cursor-pointer uppercase text-[13px] ${
                    activeLeague === lg 
                      ? "text-[#00D2FF] font-black" 
                      : "hover:text-white text-zinc-400"
                  }`}
                >
                  {lg}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "rotate-180 text-[#00D2FF]" : "text-zinc-600"}`} />
                </button>

                {/* Dropdown panel for teams under each league */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={`absolute ${data.align} mt-6 ${data.width} bg-[#03060b]/98 backdrop-blur-xl border border-zinc-900/95 rounded-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50`}
                    >
                      {/* Decorative glowing gradient header inside dropdown */}
                      <div className={`absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r ${data.color}`} />
                      
                      <div className="space-y-5">
                        {/* Header metadata */}
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                          <div>
                            <span className="text-[10px] font-mono font-black tracking-widest text-zinc-500 block uppercase">
                              {lg} REPRESENTATIVE BRAND CHANNELS
                            </span>
                            <span className="text-white text-base font-black tracking-wider block mt-1">
                              {data.motto}
                            </span>
                          </div>
                          
                          {/* Item count badge */}
                          <span className="text-[11px] font-mono font-black bg-zinc-950 border border-zinc-900 px-3 py-1 rounded-md text-zinc-400">
                            {allTeams.length} TEAMS
                          </span>
                        </div>

                        {/* Interactive dynamic Search filter inside dropdown */}
                        <div className="relative">
                          <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search ${lg} franchises...`}
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 pl-11 pr-10 text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#4fc3f7]/40 transition-colors"
                          />
                          {searchTerm && (
                            <button 
                              onClick={() => setSearchTerm("")}
                              className="absolute right-4 top-3.5 text-zinc-500 hover:text-white cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* List of Real Teams (Grouped by division when not searching) */}
                        {filteredTeams.length > 0 ? (
                          searchTerm ? (
                            <div className="grid grid-cols-3 gap-x-5 gap-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {filteredTeams.map((team) => {
                                const isTeamActive = activeTeam === team;
                                return (
                                  <button
                                    key={team}
                                    onClick={() => handleSelectTeam(lg, team)}
                                    className={`text-left px-3.5 py-2.5 rounded-xl text-[12.5px] font-black tracking-wider transition-all flex items-center justify-between group cursor-pointer ${
                                      isTeamActive
                                        ? "bg-[#4fc3f7]/10 text-[#4fc3f7] border border-[#4fc3f7]/25"
                                        : "text-zinc-500 hover:text-white hover:bg-zinc-900/50 border border-transparent"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2 truncate">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isTeamActive ? "bg-[#4fc3f7]" : "bg-zinc-800 group-hover:bg-[#4fc3f7]"}`} />
                                      <span className="truncate">{team}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className={`grid ${lg === "WNBA" || lg === "MLS" ? "grid-cols-2" : lg === "NBA" || lg === "MLB" ? "grid-cols-3" : "grid-cols-4"} gap-x-8 gap-y-5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin`}>
                              {data.divisions.map((div) => (
                                <div key={div.name} className="space-y-2">
                                  <div className="text-[11px] font-mono font-black text-[#4fc3f7] tracking-wider pb-1.5 border-b border-zinc-900 uppercase">
                                    {div.name}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {div.teams.map((team) => {
                                      const isTeamActive = activeTeam === team;
                                      return (
                                        <button
                                          key={team}
                                          onClick={() => handleSelectTeam(lg, team)}
                                          className={`text-left px-2 py-1.5 rounded-lg text-[12px] font-bold tracking-wide transition-all flex items-center gap-2 group cursor-pointer ${
                                            isTeamActive
                                              ? "bg-[#4fc3f7]/10 text-[#4fc3f7]"
                                              : "text-zinc-500 hover:text-white hover:bg-zinc-900/40"
                                          }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isTeamActive ? "bg-[#4fc3f7]" : "bg-zinc-800 group-hover:bg-[#4fc3f7]"}`} />
                                          <span className="truncate">{team}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 border border-dashed border-zinc-900 rounded-xl">
                            <p className="text-zinc-600 text-xs font-mono">NO TEAMS FOUND MATCHING "{searchTerm.toUpperCase()}"</p>
                          </div>
                        )}

                        {/* View all button */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                          <button
                            onClick={() => {
                              setActiveLeague(lg);
                              setActiveCategory("ALL");
                              setActiveTeam(null);
                              setActiveKeyword(null);
                              handleMenuHover(null);
                              handleScrollToCatalog();
                            }}
                            className="text-left text-zinc-400 hover:text-[#4fc3f7] transition-all text-[11px] font-mono tracking-widest uppercase flex items-center gap-1.5"
                          >
                            VIEW ALL GANG DROPS
                            <ArrowRight className="w-4 h-4 text-[#4fc3f7]" />
                          </button>
                          
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="text-[11px] font-mono text-[#4fc3f7] hover:underline"
                            >
                              CLEAR SEARCH FILTER
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}



          <button 
            onClick={(e) => {
              e.preventDefault();
              if (onContactOpen) {
                onContactOpen();
              } else {
                handleScrollToContact();
              }
            }}
            className="hover:text-white transition-colors cursor-pointer font-black uppercase text-[13px]"
          >
            CONTACT
          </button>

          {/* SUPPORT DROPDOWN */}
          <div
            onMouseEnter={() => handleMenuHover("SUPPORT")}
            onMouseLeave={() => handleMenuHover(null)}
            className="relative py-3"
          >
            <button
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-black uppercase text-[13px]"
            >
              SUPPORT
              <ChevronDown className="w-4 h-4 text-zinc-600" />
            </button>

            <AnimatePresence>
              {hoveredMenu === "SUPPORT" && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-6 w-64 bg-[#03060b]/98 backdrop-blur-xl border border-zinc-900 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-zinc-500 to-zinc-800" />
                  <div className="space-y-3">
                    <div className="border-b border-zinc-900 pb-2">
                      <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase block">FAN CENTER</span>
                      <span className="text-white text-xs font-black uppercase tracking-wider block mt-0.5">REPRESENTATION DESK</span>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={onChatOpen}
                        className="w-full text-left px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 group"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#00D2FF]" />
                        Locker Room Chat
                      </button>
                      <button
                        onClick={() => {
                          handleMenuHover(null);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                        }}
                        className="w-full text-left px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 group"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#00D2FF]" />
                        FAQs & Policies
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right Action buttons - Trophies & Cart triggers */}
        <div className="flex items-center gap-4 shrink-0 ml-4">
          
          {/* Fan Stand premium button */}
          <button
            onClick={handleScrollToFanStand}
            className="flex bg-transparent border border-zinc-800 hover:border-[#00D2FF] text-white hover:text-[#00D2FF] text-[12px] font-black tracking-widest uppercase py-3.5 px-4 sm:px-6 rounded-xl transition-all duration-300 items-center gap-2.5 cursor-pointer shadow-md shadow-black"
          >
            <Trophy className="w-5 h-5 text-[#00D2FF] animate-bounce" />
            <span className="hidden sm:inline">FAN STAND</span>
          </button>

          {/* Cart Trigger button */}
          <button
            onClick={onCartOpen}
            className="text-zinc-300 hover:text-[#00D2FF] hover:bg-zinc-900 rounded-xl transition-all flex items-center gap-2.5 relative border border-zinc-900 bg-zinc-950/40 px-5 py-3"
            title="Open Cart"
          >
            <ShoppingBag className="w-5.5 h-5.5 text-zinc-400" />
            <span className="hidden sm:inline text-[12px] font-black tracking-wider text-zinc-300">BAG</span>
            {cartCount > 0 && (
              <span className="bg-[#00D2FF] text-black font-mono font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </button>
          
          {/* Mobile Chat Indicator */}
          <button
            onClick={onChatOpen}
            className="flex xl:hidden p-4 text-zinc-400 hover:text-[#00D2FF] hover:bg-zinc-900 rounded-xl transition-all relative border border-zinc-900 bg-[#020408]"
            title="Coach Cor Chat"
          >
            <MessageSquare className="w-5.5 h-5.5 text-[#00D2FF]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00D2FF] rounded-full animate-ping"></span>
          </button>
        </div>

      </div>

      {currentView !== "admin" && (
        <div className="w-full mt-4 pt-3.5 border-t border-zinc-900/60 flex items-center gap-3 relative select-none">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollCollections("left")}
            className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-900 hover:border-[#00D2FF]/40 text-zinc-400 hover:text-[#00D2FF] hover:bg-zinc-900/40 transition-all cursor-pointer shadow-md select-none shrink-0"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable List Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-3 py-1 scroll-smooth"
          >
            {QUICK_COLLECTIONS.map((col) => {
              // Check if currently active
              let isActive = false;
              if (col.type === "league") {
                isActive = activeLeague === col.value && activeTeam === null && activeKeyword === null;
              } else if (col.type === "keyword") {
                isActive = activeKeyword === col.value;
              }

              return (
                <button
                  key={col.label}
                  onClick={() => {
                    if (col.type === "league") {
                      setActiveLeague(col.value);
                      setActiveTeam(null);
                      setActiveKeyword(null);
                    } else if (col.type === "keyword") {
                      setActiveLeague("ALL");
                      setActiveCategory("ALL");
                      setActiveTeam(null);
                      setActiveKeyword(col.value);
                    }
                    handleScrollToCatalog();
                  }}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap border cursor-pointer flex items-center gap-1.5 select-none ${
                    isActive
                      ? "bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/30 shadow-md shadow-[#00D2FF]/5"
                      : "bg-zinc-950/60 text-zinc-400 border-zinc-900/80 hover:text-white hover:border-zinc-800"
                  }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollCollections("right")}
            className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-900 hover:border-[#00D2FF]/40 text-zinc-400 hover:text-[#00D2FF] hover:bg-zinc-900/40 transition-all cursor-pointer shadow-md select-none shrink-0"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
