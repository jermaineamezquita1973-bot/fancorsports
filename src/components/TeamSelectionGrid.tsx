import React from "react";
import { LEAGUE_DROP_DATA } from "./Navbar";
import { Sparkles, Trophy } from "lucide-react";

const LEAGUE_HEADER_METADATA: Record<string, { image: string; tag: string; description: string; accent: string }> = {
  NFL: {
    image: "/nfl_championship.jpg",
    tag: "GRIDIRON LEGENDS",
    description: "Heavyweight collegiate-cut fleece hoodies, authentic tackle-twill vintage coach jackets, and bespoke stadium wear designed for elite franchise impact.",
    accent: "#00D2FF"
  },
  NBA: {
    image: "/court.jpg",
    tag: "HARDWOOD ELITE",
    description: "Authentic drop-shoulder mesh jersey tanks, heavyweight pre-shrunk tees, and luxury court-inspired apparel for true hoops purists.",
    accent: "#a855f7"
  },
  WNBA: {
    image: "/wnba.jpg",
    tag: "THE ORANGE SILHOUETTE",
    description: "Empowering silhouettes, premium heavy hoodies, and signature game day collections celebrating the pinnacle of women's basketball culture.",
    accent: "#f97316"
  },
  MLB: {
    image: "/mlb.jpg",
    tag: "DIAMOND DYNASTY",
    description: "Classic button-down baseball flannels, premium embroidered 3D-script caps, and heavy wool-blend warmups loaded with historic franchise heritage.",
    accent: "#10b981"
  },
  NHL: {
    image: "/Hockey.webp",
    tag: "ICE GLADIATORS",
    description: "Heavy-duty tackle-twill vintage hockey sweaters, insulated arena jackets, and durable zip warmups built to fight the stadium frost in elite style.",
    accent: "#06b6d4"
  },
  MLS: {
    image: "/soccer_pitch.jpg",
    tag: "THE PITCH COLLECTIVE",
    description: "Breathable moisture-wicking training kits, minimal premium crest tees, and supporters scarves crafted for absolute club devotion.",
    accent: "#14b8a6"
  }
};

interface TeamSelectionGridProps {
  league: string;
  onSelectTeam: (team: string) => void;
}

// Extensive signature brand colors & abbreviation database for professional look
const TEAM_DATABASE: Record<string, [string, string, string]> = {
  // NFL
  "Buffalo Bills": ["#00338D", "#C60C30", "BUF"],
  "Miami Dolphins": ["#008E97", "#FC4C02", "MIA"],
  "New England Patriots": ["#002244", "#C60C30", "NE"],
  "New York Jets": ["#125740", "#FFFFFF", "NYJ"],
  "Baltimore Ravens": ["#241773", "#9E7C0C", "BAL"],
  "Cincinnati Bengals": ["#FB4F14", "#000000", "CIN"],
  "Cleveland Browns": ["#311D00", "#FF3C00", "CLE"],
  "Pittsburgh Steelers": ["#FFB612", "#101820", "PIT"],
  "Houston Texans": ["#03202F", "#A71930", "HOU"],
  "Houston Oilers": ["#4B92DB", "#C60C30", "OIL"],
  "Indianapolis Colts": ["#002C5F", "#A2AAAD", "IND"],
  "Jacksonville Jaguars": ["#006778", "#D7A22A", "JAX"],
  "Tennessee Titans": ["#4B92DB", "#C60C30", "TEN"],
  "Denver Broncos": ["#FB4F14", "#002244", "DEN"],
  "Kansas City Chiefs": ["#E31837", "#FFB81C", "KC"],
  "Las Vegas Raiders": ["#000000", "#A5ACAF", "LVR"],
  "Los Angeles Chargers": ["#0080C6", "#FFC20E", "LAC"],
  "Dallas Cowboys": ["#003594", "#869397", "DAL"],
  "New York Giants": ["#0B2265", "#A71930", "NYG"],
  "Philadelphia Eagles": ["#004C54", "#A5ACAF", "PHI"],
  "Washington Commanders": ["#5A1414", "#FFB612", "WAS"],
  "Chicago Bears": ["#0B2265", "#C83803", "CHI"],
  "Detroit Lions": ["#0076B6", "#B0B7BC", "DET"],
  "Green Bay Packers": ["#203731", "#FFB612", "GB"],
  "Minnesota Vikings": ["#4F2683", "#FFC62F", "MIN"],
  "Atlanta Falcons": ["#A71930", "#000000", "ATL"],
  "Carolina Panthers": ["#0085CA", "#101820", "CAR"],
  "New Orleans Saints": ["#D3BC8D", "#101820", "NO"],
  "Tampa Bay Buccaneers": ["#D50A0A", "#34302B", "TB"],
  "Arizona Cardinals": ["#97233F", "#FFB612", "ARI"],
  "Los Angeles Rams": ["#003594", "#FFA300", "LAR"],
  "San Francisco 49ers": ["#AA0000", "#B3995D", "SF"],
  "Seattle Seahawks": ["#002244", "#69BE28", "SEA"],

  // NBA
  "Boston Celtics": ["#007A33", "#BA9653", "BOS"],
  "Brooklyn Nets": ["#000000", "#FFFFFF", "BKN"],
  "New York Knicks": ["#006BB6", "#F58426", "NYK"],
  "Philadelphia 76ers": ["#006BB6", "#ED174C", "PHI"],
  "Toronto Raptors": ["#CE1141", "#000000", "TOR"],
  "Chicago Bulls": ["#CE1141", "#000000", "CHI"],
  "Cleveland Cavaliers": ["#860038", "#FDBB30", "CLE"],
  "Detroit Pistons": ["#C8102E", "#1D428A", "DET"],
  "Indiana Pacers": ["#002D62", "#FDBB30", "IND"],
  "Milwaukee Bucks": ["#00471B", "#EEE1C6", "MIL"],
  "Atlanta Hawks": ["#E03A3E", "#C1D32F", "ATL"],
  "Charlotte Hornets": ["#1D1160", "#00788C", "CHA"],
  "Miami Heat": ["#98002E", "#F9A01B", "MIA"],
  "Orlando Magic": ["#0077C0", "#C4CED4", "ORL"],
  "Washington Wizards": ["#002B5C", "#E31837", "WAS"],
  "Denver Nuggets": ["#0E2240", "#FEC524", "DEN"],
  "Minnesota Timberwolves": ["#0C2340", "#236192", "MIN"],
  "Oklahoma City Thunder": ["#007AC1", "#EF3B24", "OKC"],
  "Portland Trail Blazers": ["#E03A3E", "#000000", "POR"],
  "Utah Jazz": ["#002B49", "#FDBB30", "UTA"],
  "Golden State Warriors": ["#1D428A", "#FFC72C", "GSW"],
  "Los Angeles Clippers": ["#C8102E", "#1D428A", "LAC"],
  "Los Angeles Lakers": ["#552583", "#FDB927", "LAL"],
  "Phoenix Suns": ["#1D1160", "#E56020", "PHX"],
  "Sacramento Kings": ["#5A2D81", "#63727A", "SAC"],
  "Dallas Mavericks": ["#00538C", "#B8C4CA", "DAL"],
  "Houston Rockets": ["#CE1141", "#000000", "HOU"],
  "Memphis Grizzlies": ["#5D76A9", "#12173F", "MEM"],
  "New Orleans Pelicans": ["#0C2340", "#C8102E", "NOP"],
  "San Antonio Spurs": ["#060304", "#C4CED4", "SAS"],

  // WNBA
  "Atlanta Dream": ["#C8102E", "#80C5EC", "ATL"],
  "Chicago Sky": ["#0A2240", "#FFCD00", "CHI"],
  "Connecticut Sun": ["#002B49", "#FF6B00", "CON"],
  "Indiana Fever": ["#002D62", "#E31837", "IND"],
  "New York Liberty": ["#578F8C", "#000000", "NYL"],
  "Washington Mystics": ["#002B5C", "#C8102E", "WAS"],
  "Dallas Wings": ["#002B49", "#C4D600", "DAL"],
  "Golden State Valkyries": ["#432E6A", "#B0E0E6", "GSV"],
  "Las Vegas Aces": ["#000000", "#E31837", "LVA"],
  "Los Angeles Sparks": ["#00538C", "#FDB927", "LAS"],
  "Minnesota Lynx": ["#0C2340", "#78BE20", "MIN"],
  "Phoenix Mercury": ["#201844", "#FF6B00", "PHX"],
  "Seattle Storm": ["#00471B", "#F3D03E", "SEA"],

  // MLB
  "Baltimore Orioles": ["#DF4601", "#000000", "BAL"],
  "Boston Red Sox": ["#BD3039", "#0D2B56", "BOS"],
  "New York Yankees": ["#0C2340", "#C4CED4", "NYY"],
  "Tampa Bay Rays": ["#092C5C", "#8FBCE6", "TB"],
  "Toronto Blue Jays": ["#13274F", "#1D428A", "TOR"],
  "Chicago White Sox": ["#000000", "#C4CED4", "CHW"],
  "Cleveland Guardians": ["#0C2340", "#E31837", "CLE"],
  "Detroit Tigers": ["#0C2340", "#FA4616", "DET"],
  "Kansas City Royals": ["#004687", "#C5AE7C", "KC"],
  "Minnesota Twins": ["#002B5C", "#D31145", "MIN"],
  "Houston Astros": ["#002D62", "#EB6E1F", "HOU"],
  "Los Angeles Angels": ["#BA0021", "#003263", "LAA"],
  "Oakland Athletics": ["#003831", "#EFB21E", "OAK"],
  "Seattle Mariners": ["#0C2340", "#005C5C", "SEA"],
  "Texas Rangers": ["#003278", "#C0111F", "TEX"],
  "Atlanta Braves": ["#13274F", "#CE1141", "ATL"],
  "Miami Marlins": ["#00A3E0", "#EF3340", "MIA"],
  "New York Mets": ["#002D62", "#FF5910", "NYM"],
  "Philadelphia Phillies": ["#E81828", "#293F82", "PHI"],
  "Washington Nationals": ["#AB0003", "#142243", "WSH"],
  "Chicago Cubs": ["#0E3386", "#CC3433", "CHC"],
  "Cincinnati Reds": ["#C6011F", "#000000", "CIN"],
  "Milwaukee Brewers": ["#12284C", "#FFC52F", "MIL"],
  "Pittsburgh Pirates": ["#FDB827", "#000000", "PIT"],
  "St. Louis Cardinals": ["#C41D3B", "#FEDD00", "STL"],
  "Arizona Diamondbacks": ["#A71930", "#E3D4AD", "ARI"],
  "Colorado Rockies": ["#330066", "#C4CED4", "COL"],
  "Los Angeles Dodgers": ["#005A9C", "#A5ACAF", "LAD"],
  "San Diego Padres": ["#2F241D", "#FFC425", "SD"],
  "San Francisco Giants": ["#FD5A1E", "#27251F", "SF"],

  // NHL
  "Carolina Hurricanes": ["#CC0000", "#000000", "CAR"],
  "Columbus Blue Jackets": ["#002654", "#E4183C", "CBJ"],
  "New Jersey Devils": ["#CE1126", "#000000", "NJD"],
  "New York Islanders": ["#00539B", "#F47D30", "NYI"],
  "New York Rangers": ["#0038A8", "#CE1126", "NYR"],
  "Philadelphia Flyers": ["#F74902", "#000000", "PHI"],
  "Pittsburgh Penguins": ["#000000", "#FCB827", "PIT"],
  "Washington Capitals": ["#041E42", "#C8102E", "WSH"],
  "Boston Bruins": ["#FFB81C", "#000000", "BOS"],
  "Buffalo Sabres": ["#002654", "#FCB827", "BUF"],
  "Detroit Red Wings": ["#CE1126", "#FFFFFF", "DET"],
  "Florida Panthers": ["#041E42", "#C8102E", "FLA"],
  "Montreal Canadiens": ["#AF1E2D", "#192168", "MTL"],
  "Ottawa Senators": ["#C8102E", "#000000", "OTT"],
  "Tampa Bay Lightning": ["#002868", "#FFFFFF", "TBL"],
  "Toronto Maple Leafs": ["#00205B", "#FFFFFF", "TOR"],
  "Chicago Blackhawks": ["#CF0A2C", "#000000", "CHI"],
  "Colorado Avalanche": ["#6F263D", "#236192", "COL"],
  "Dallas Stars": ["#006847", "#8F8F8C", "DAL"],
  "Minnesota Wild": ["#154734", "#A6192E", "MIN"],
  "Nashville Predators": ["#FDBB30", "#041E42", "NSH"],
  "St. Louis Blues": ["#002F87", "#FCB827", "STL"],
  "Utah Mammoth": ["#010101", "#4fc3f7", "UTA"],
  "Winnipeg Jets": ["#041E42", "#004C97", "WPG"],
  "Anaheim Ducks": ["#F47A38", "#B09862", "ANA"],
  "Calgary Flames": ["#C8102E", "#F1BE48", "CGY"],
  "Edmonton Oilers": ["#041E42", "#FF671F", "EDM"],
  "Los Angeles Kings": ["#111111", "#A2AAAD", "LAK"],
  "San Jose Sharks": ["#006D75", "#EA7200", "SJS"],
  "Seattle Kraken": ["#001628", "#99D9D9", "SEA"],
  "Vancouver Canucks": ["#00205B", "#041E42", "VAN"],
  "Vegas Golden Knights": ["#B3995D", "#111111", "VGK"],

  // MLS
  "Atlanta United FC": ["#80000A", "#221F20", "ATL"],
  "Charlotte FC": ["#1A85C8", "#111111", "CLT"],
  "Chicago Fire FC": ["#FF0000", "#001E62", "CHI"],
  "FC Cincinnati": ["#263B80", "#F05323", "CIN"],
  "Columbus Crew": ["#FEDD00", "#000000", "CLB"],
  "D.C. United": ["#000000", "#EF3B24", "DCU"],
  "Inter Miami CF": ["#F4B5CD", "#231F20", "MIA"],
  "CF Montréal": ["#00529B", "#000000", "MTL"],
  "Nashville SC": ["#ECE81A", "#1F1F3A", "NSH"],
  "New England Revolution": ["#0A2240", "#CE1141", "NER"],
  "New York City FC": ["#6CACE4", "#041E42", "NYC"],
  "New York Red Bulls": ["#E31351", "#002F6C", "NYR"],
  "Orlando City SC": ["#633492", "#FDB927", "ORL"],
  "Philadelphia Union": ["#002D55", "#B38728", "PHI"],
  "Toronto FC": ["#B30024", "#414142", "TOR"],
  "Austin FC": ["#00B140", "#000000", "ATX"],
  "Colorado Rapids": ["#862633", "#86CEF4", "COL"],
  "FC Dallas": ["#E81B23", "#00205B", "FCD"],
  "Houston Dynamo FC": ["#FF6B00", "#101820", "HOU"],
  "Sporting Kansas City": ["#A3B6D9", "#002D62", "SKC"],
  "LA Galaxy": ["#00245E", "#FFD200", "LAG"],
  "Los Angeles FC": ["#000000", "#C39E5C", "LAF"],
  "Minnesota United FC": ["#8CD2F4", "#231F20", "MNU"],
  "Portland Timbers": ["#004812", "#EAE615", "POR"],
  "Real Salt Lake": ["#B30838", "#071D49", "RSL"],
  "San Jose Earthquakes": ["#0067B1", "#000000", "SJE"],
  "Seattle Sounders FC": ["#005826", "#658D1B", "SEA"],
  "St. Louis City SC": ["#E31351", "#002F6C", "STL"],
  "Vancouver Whitecaps FC": ["#00245E", "#94B2E3", "VAN"],
  "San Diego FC": ["#182B49", "#D1A153", "SDF"]
};

// Retrieve specific team metadata or compute deterministic fallback
function getTeamMeta(teamName: string): [string, string, string] {
  if (TEAM_DATABASE[teamName]) {
    return TEAM_DATABASE[teamName];
  }
  
  // Custom abbreviation extractor
  const cleanName = teamName.replace(/[^a-zA-Z\s]/g, "");
  const words = cleanName.trim().split(/\s+/);
  let initials = "";
  if (words.length >= 2) {
    initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length > 0) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else {
    initials = "FC";
  }
  
  // Deterministic colors hash generator
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash1 = teamName.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = teamName.charCodeAt(i) * 31 + ((hash2 << 7) - hash2);
  }
  
  const colors1 = ["#00338D", "#008E97", "#241773", "#002C5F", "#E31837", "#0080C6", "#004C54", "#203731", "#4F2683", "#007A33", "#006BB6", "#CE1141", "#860038", "#1D428A"];
  const colors2 = ["#C60C30", "#FC4C02", "#FFFFFF", "#9E7C0C", "#FF3C00", "#FFB612", "#D7A22A", "#A5ACAF", "#FFC20E", "#BA9653", "#F58426", "#C1D32F", "#00788C", "#FDB927"];
  
  const c1 = colors1[Math.abs(hash1) % colors1.length];
  const c2 = colors2[Math.abs(hash2) % colors2.length];
  
  return [c1, c2, initials];
}

export default function TeamSelectionGrid({ league, onSelectTeam }: TeamSelectionGridProps) {
  // Get the league data from LEAGUE_DROP_DATA
  const leagueData = LEAGUE_DROP_DATA[league as keyof typeof LEAGUE_DROP_DATA];
  
  if (!leagueData) return null;

  // Custom vector SVG sport element generator
  const renderTeamSVG = (teamName: string, lgName: string) => {
    const [primary, secondary, initials] = getTeamMeta(teamName);
    const lg = lgName.toUpperCase();
    
    let sportIcon = null;
    
    if (lg === "NFL") {
      sportIcon = (
        <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="7" width="14" height="10" rx="5" />
          <path d="M5 12h14M10 7v10M14 7v10M7 10h10M7 14h10" />
        </svg>
      );
    } else if (lg === "NBA" || lg === "WNBA") {
      sportIcon = (
        <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M6.2 6.2c3.4 3.4 3.4 8.2 0 11.6M17.8 6.2c-3.4 3.4-3.4 8.2 0 11.6M3 12h18M12 3v18" />
        </svg>
      );
    } else if (lg === "MLB") {
      sportIcon = (
        <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 4a12 12 0 0 1 0 16M15.5 4a12 12 0 0 0 0 16" />
        </svg>
      );
    } else if (lg === "NHL") {
      sportIcon = (
        <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 19L19 5M19 5h-4M19 5v4M4 20l14-14M18 6h-3" />
          <circle cx="12" cy="15" r="2.5" />
        </svg>
      );
    } else if (lg === "MLS") {
      sportIcon = (
        <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3l3 4.5h-6L12 3zM3.5 10l4.5 1.5-1.5 4.5-3-6zM20.5 10l-4.5 1.5 1.5 4.5 3-6z" />
        </svg>
      );
    } else {
      sportIcon = (
        <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M12 18v3M8 21h8M12 3a6 6 0 0 1 6 6v5" />
        </svg>
      );
    }

    return (
      <div 
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg overflow-hidden transition-transform duration-300 border-2" 
        style={{ borderColor: secondary }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at top, ${primary} 0%, #030303 100%)`
          }}
        />
        <div 
          className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none"
          style={{
            boxShadow: `inset 0 0 10px ${secondary}`
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white">
          <span className="font-sans font-black text-xs tracking-wider leading-none select-none drop-shadow-md">
            {initials}
          </span>
          <div className="text-[9px] mt-0.5" style={{ color: secondary }}>
            {sportIcon}
          </div>
        </div>
      </div>
    );
  };

  const headerMeta = LEAGUE_HEADER_METADATA[league.toUpperCase()] || {
    image: "/hero.jpg",
    tag: "PREMIUM ATHLETIC APPAREL",
    description: "Explore the ultimate custom collections across professional leagues, designed for elite performance and streetwear aesthetic.",
    accent: "#00D2FF"
  };

  return (
    <section className="bg-[#E2F1FA] py-16 px-4 sm:px-6 lg:px-8 select-none w-full">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Immersive League Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/50 shadow-2xl min-h-[300px] md:min-h-[360px] flex items-center p-8 md:p-14 text-white">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={headerMeta.image}
              alt={`${league} Banner`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>

          {/* Banner content */}
          <div className="relative z-10 max-w-2xl space-y-4 md:space-y-6 text-left">
            <span 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-mono font-black border uppercase tracking-[0.2em] rounded-full backdrop-blur-md bg-black/45"
              style={{ borderColor: `${headerMeta.accent}30`, color: headerMeta.accent }}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {headerMeta.tag}
            </span>
            
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-wider leading-none drop-shadow">
                SELECT YOUR {league} TEAM
              </h2>
              <div className="h-1 w-24 rounded-full" style={{ backgroundColor: headerMeta.accent }} />
            </div>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed max-w-xl drop-shadow-md">
              {headerMeta.description}
            </p>
          </div>
        </div>

        {/* Render Divisions in the Exact Navbar Dropdown Order */}
        <div className="space-y-12">
          {leagueData.divisions.map((division) => (
            <div key={division.name} className="space-y-6">
              
              {/* Division Header Banner */}
              <div className="flex items-center gap-4 text-left">
                <span className="bg-[#002855] text-white text-[10px] font-extrabold uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg shadow-sm">
                  {division.name}
                </span>
                <span className="h-[1.5px] flex-1 bg-gradient-to-r from-zinc-300 to-transparent"></span>
              </div>

              {/* Grid of Teams */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {division.teams.map((team) => (
                  <button
                    key={team}
                    id={`team-btn-${team.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => onSelectTeam(team)}
                    className="group flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-white border border-zinc-200/70 hover:border-blue-400 hover:shadow-xl hover:shadow-[#002855]/5 hover:scale-[1.04] transition-all duration-300 cursor-pointer active:scale-95 select-none space-y-3"
                  >
                    {/* High-Fidelity Custom Team Logo */}
                    {renderTeamSVG(team, league)}

                    {/* Team Display Label */}
                    <span className="text-[#002855] font-black tracking-wider uppercase text-xs md:text-[13px] leading-tight group-hover:text-blue-500 transition-colors">
                      {team}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
