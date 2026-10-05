export interface MasterTeam {
  league: "NFL" | "NBA" | "WNBA" | "MLB" | "NHL" | "MLS";
  team: string;
}

export const MASTER_TEAMS_LIST: MasterTeam[] = [
  // NFL (32 teams)
  { league: "NFL", team: "Arizona Cardinals" },
  { league: "NFL", team: "Atlanta Falcons" },
  { league: "NFL", team: "Baltimore Ravens" },
  { league: "NFL", team: "Buffalo Bills" },
  { league: "NFL", team: "Carolina Panthers" },
  { league: "NFL", team: "Chicago Bears" },
  { league: "NFL", team: "Cincinnati Bengals" },
  { league: "NFL", team: "Cleveland Browns" },
  { league: "NFL", team: "Dallas Cowboys" },
  { league: "NFL", team: "Denver Broncos" },
  { league: "NFL", team: "Detroit Lions" },
  { league: "NFL", team: "Green Bay Packers" },
  { league: "NFL", team: "Houston Oilers" },
  { league: "NFL", team: "Houston Texans" },
  { league: "NFL", team: "Indianapolis Colts" },
  { league: "NFL", team: "Jacksonville Jaguars" },
  { league: "NFL", team: "Kansas City Chiefs" },
  { league: "NFL", team: "Las Vegas Raiders" },
  { league: "NFL", team: "Los Angeles Chargers" },
  { league: "NFL", team: "Los Angeles Rams" },
  { league: "NFL", team: "Miami Dolphins" },
  { league: "NFL", team: "Minnesota Vikings" },
  { league: "NFL", team: "New England Patriots" },
  { league: "NFL", team: "New Orleans Saints" },
  { league: "NFL", team: "New York Giants" },
  { league: "NFL", team: "New York Jets" },
  { league: "NFL", team: "Philadelphia Eagles" },
  { league: "NFL", team: "Pittsburgh Steelers" },
  { league: "NFL", team: "San Francisco 49ers" },
  { league: "NFL", team: "Seattle Seahawks" },
  { league: "NFL", team: "Tampa Bay Buccaneers" },
  { league: "NFL", team: "Tennessee Titans" },
  { league: "NFL", team: "Washington Commanders" },

  // NBA (32 teams)
  { league: "NBA", team: "Atlanta Hawks" },
  { league: "NBA", team: "Boston Celtics" },
  { league: "NBA", team: "Brooklyn Nets" },
  { league: "NBA", team: "Charlotte Hornets" },
  { league: "NBA", team: "Chicago Bulls" },
  { league: "NBA", team: "Cleveland Cavaliers" },
  { league: "NBA", team: "Dallas Mavericks" },
  { league: "NBA", team: "Denver Nuggets" },
  { league: "NBA", team: "Detroit Pistons" },
  { league: "NBA", team: "Golden State Warriors" },
  { league: "NBA", team: "Houston Rockets" },
  { league: "NBA", team: "Indiana Pacers" },
  { league: "NBA", team: "Las Vegas Vipers" },
  { league: "NBA", team: "Los Angeles Clippers" },
  { league: "NBA", team: "Los Angeles Lakers" },
  { league: "NBA", team: "Memphis Grizzlies" },
  { league: "NBA", team: "Miami Heat" },
  { league: "NBA", team: "Milwaukee Bucks" },
  { league: "NBA", team: "Minnesota Timberwolves" },
  { league: "NBA", team: "New Orleans Pelicans" },
  { league: "NBA", team: "New York Knicks" },
  { league: "NBA", team: "Oklahoma City Thunder" },
  { league: "NBA", team: "Orlando Magic" },
  { league: "NBA", team: "Philadelphia 76ers" },
  { league: "NBA", team: "Phoenix Suns" },
  { league: "NBA", team: "Portland Trail Blazers" },
  { league: "NBA", team: "Sacramento Kings" },
  { league: "NBA", team: "San Antonio Spurs" },
  { league: "NBA", team: "Seattle SuperSonics" },
  { league: "NBA", team: "Toronto Raptors" },
  { league: "NBA", team: "Utah Jazz" },
  { league: "NBA", team: "Washington Wizards" },

  // WNBA (13 teams)
  { league: "WNBA", team: "Atlanta Dream" },
  { league: "WNBA", team: "Chicago Sky" },
  { league: "WNBA", team: "Connecticut Sun" },
  { league: "WNBA", team: "Dallas Wings" },
  { league: "WNBA", team: "Golden State Valkyries" },
  { league: "WNBA", team: "Indiana Fever" },
  { league: "WNBA", team: "Las Vegas Aces" },
  { league: "WNBA", team: "Los Angeles Sparks" },
  { league: "WNBA", team: "Minnesota Lynx" },
  { league: "WNBA", team: "New York Liberty" },
  { league: "WNBA", team: "Phoenix Mercury" },
  { league: "WNBA", team: "Seattle Storm" },
  { league: "WNBA", team: "Washington Mystics" },

  // MLB (32 teams)
  { league: "MLB", team: "Arizona Diamondbacks" },
  { league: "MLB", team: "Atlanta Braves" },
  { league: "MLB", team: "Baltimore Orioles" },
  { league: "MLB", team: "Boston Red Sox" },
  { league: "MLB", team: "Chicago Cubs" },
  { league: "MLB", team: "Chicago White Sox" },
  { league: "MLB", team: "Cincinnati Reds" },
  { league: "MLB", team: "Cleveland Guardians" },
  { league: "MLB", team: "Colorado Rockies" },
  { league: "MLB", team: "Detroit Tigers" },
  { league: "MLB", team: "Houston Astros" },
  { league: "MLB", team: "Kansas City Royals" },
  { league: "MLB", team: "Los Angeles Angels" },
  { league: "MLB", team: "Los Angeles Dodgers" },
  { league: "MLB", team: "Miami Marlins" },
  { league: "MLB", team: "Milwaukee Brewers" },
  { league: "MLB", team: "Minnesota Twins" },
  { league: "MLB", team: "Montreal Expos" },
  { league: "MLB", team: "New York Mets" },
  { league: "MLB", team: "New York Yankees" },
  { league: "MLB", team: "Oakland Athletics" },
  { league: "MLB", team: "Philadelphia Phillies" },
  { league: "MLB", team: "Pittsburgh Pirates" },
  { league: "MLB", team: "Portland Pioneers" },
  { league: "MLB", team: "San Diego Padres" },
  { league: "MLB", team: "San Francisco Giants" },
  { league: "MLB", team: "Seattle Mariners" },
  { league: "MLB", team: "St. Louis Cardinals" },
  { league: "MLB", team: "Tampa Bay Rays" },
  { league: "MLB", team: "Texas Rangers" },
  { league: "MLB", team: "Toronto Blue Jays" },
  { league: "MLB", team: "Washington Nationals" },

  // NHL (32 teams)
  { league: "NHL", team: "Anaheim Ducks" },
  { league: "NHL", team: "Boston Bruins" },
  { league: "NHL", team: "Buffalo Sabres" },
  { league: "NHL", team: "Calgary Flames" },
  { league: "NHL", team: "Carolina Hurricanes" },
  { league: "NHL", team: "Chicago Blackhawks" },
  { league: "NHL", team: "Colorado Avalanche" },
  { league: "NHL", team: "Columbus Blue Jackets" },
  { league: "NHL", team: "Dallas Stars" },
  { league: "NHL", team: "Detroit Red Wings" },
  { league: "NHL", team: "Edmonton Oilers" },
  { league: "NHL", team: "Florida Panthers" },
  { league: "NHL", team: "Los Angeles Kings" },
  { league: "NHL", team: "Minnesota Wild" },
  { league: "NHL", team: "Montreal Canadiens" },
  { league: "NHL", team: "Nashville Predators" },
  { league: "NHL", team: "New Jersey Devils" },
  { league: "NHL", team: "New York Islanders" },
  { league: "NHL", team: "New York Rangers" },
  { league: "NHL", team: "Ottawa Senators" },
  { league: "NHL", team: "Philadelphia Flyers" },
  { league: "NHL", team: "Pittsburgh Penguins" },
  { league: "NHL", team: "San Jose Sharks" },
  { league: "NHL", team: "Seattle Kraken" },
  { league: "NHL", team: "St. Louis Blues" },
  { league: "NHL", team: "Tampa Bay Lightning" },
  { league: "NHL", team: "Toronto Maple Leafs" },
  { league: "NHL", team: "Utah Mammoth" },
  { league: "NHL", team: "Vancouver Canucks" },
  { league: "NHL", team: "Vegas Golden Knights" },
  { league: "NHL", team: "Washington Capitals" },
  { league: "NHL", team: "Winnipeg Jets" },

  // MLS (32 teams)
  { league: "MLS", team: "Atlanta United FC" },
  { league: "MLS", team: "Austin FC" },
  { league: "MLS", team: "Charlotte FC" },
  { league: "MLS", team: "Chicago Fire FC" },
  { league: "MLS", team: "Colorado Rapids" },
  { league: "MLS", team: "Columbus Crew" },
  { league: "MLS", team: "D.C. United" },
  { league: "MLS", team: "FC Cincinnati" },
  { league: "MLS", team: "FC Dallas" },
  { league: "MLS", team: "Houston Dynamo FC" },
  { league: "MLS", team: "Inter Miami CF" },
  { league: "MLS", team: "LA Galaxy" },
  { league: "MLS", team: "Los Angeles FC" },
  { league: "MLS", team: "Minnesota United FC" },
  { league: "MLS", team: "CF Montréal" },
  { league: "MLS", team: "Nashville SC" },
  { league: "MLS", team: "New England Revolution" },
  { league: "MLS", team: "New York City FC" },
  { league: "MLS", team: "New York Red Bulls" },
  { league: "MLS", team: "Orlando City SC" },
  { league: "MLS", team: "Philadelphia Union" },
  { league: "MLS", team: "Portland Timbers" },
  { league: "MLS", team: "Real Salt Lake" },
  { league: "MLS", team: "San Diego FC" },
  { league: "MLS", team: "San Jose Earthquakes" },
  { league: "MLS", team: "Seattle Sounders FC" },
  { league: "MLS", team: "Sporting Kansas City" },
  { league: "MLS", team: "St. Louis City SC" },
  { league: "MLS", team: "Toronto FC" },
  { league: "MLS", team: "Vancouver Whitecaps FC" }
];

export function mapPrintifyProductsToCatalog(printifyRawList: any[]): any[] {
  if (!printifyRawList || !Array.isArray(printifyRawList) || printifyRawList.length === 0) {
    return [];
  }

  const mappedProducts: any[] = [];
  const totalSlots = printifyRawList.length;

  for (let i = 0; i < totalSlots; i++) {
    const rawP = printifyRawList[i];
    if (!rawP) continue;

    const titleLower = rawP.title ? rawP.title.toLowerCase() : "";
    const descLower = rawP.description ? rawP.description.toLowerCase() : "";
    const rawTags = rawP.tags || [];
    const productTags = rawTags.map((t: any) => String(t).trim().toLowerCase());

    let productLeague = "Other";
    let productTeam = "FanCor Iconz"; // Default if no team match is found

    // Try to find a matched team from MASTER_TEAMS_LIST
    const matchedTeam = MASTER_TEAMS_LIST.find((t) => {
      const teamLower = t.team.toLowerCase();
      const words = t.team.split(" ");
      const mascot = words[words.length - 1].toLowerCase();

      // Check for exact word boundary matches for team or mascot to prevent false substring matches
      const wordRegexTeam = new RegExp(`\\b${teamLower}\\b`, "i");
      const wordRegexMascot = new RegExp(`\\b${mascot}\\b`, "i");

      const matchByTitle = wordRegexTeam.test(titleLower) || wordRegexMascot.test(titleLower);
      const matchByDesc = wordRegexTeam.test(descLower) || wordRegexMascot.test(descLower);
      const matchByTags = productTags.some((tag: string) => 
        tag === teamLower || 
        tag === mascot ||
        tag.includes(teamLower) || 
        tag.includes(mascot)
      );

      return matchByTitle || matchByTags || matchByDesc;
    });

    if (matchedTeam) {
      productTeam = matchedTeam.team;
      productLeague = matchedTeam.league;
    } else {
      // If no team matched, we can still check if a league name itself is mentioned
      if (titleLower.includes("nba") || productTags.includes("nba") || descLower.includes("nba")) productLeague = "NBA";
      else if (titleLower.includes("nfl") || productTags.includes("nfl") || descLower.includes("nfl")) productLeague = "NFL";
      else if (titleLower.includes("mlb") || productTags.includes("mlb") || descLower.includes("mlb")) productLeague = "MLB";
      else if (titleLower.includes("wnba") || productTags.includes("wnba") || descLower.includes("wnba")) productLeague = "WNBA";
      else if (titleLower.includes("nhl") || productTags.includes("nhl") || descLower.includes("nhl")) productLeague = "NHL";
      else if (titleLower.includes("mls") || productTags.includes("mls") || descLower.includes("mls")) productLeague = "MLS";
    }

    const priceVal = rawP.variants && rawP.variants.length > 0 
      ? rawP.variants[0].price / 100 
      : 29.99;

    const price = `$${priceVal.toFixed(2)}`;

    // Always use "tee" and "T-Shirts" per user constraints
    const productType = "tee";
    const category = "T-Shirts";

    const gradients = [
      "from-blue-900/60 to-black",
      "from-red-900/60 to-black",
      "from-emerald-900/60 to-black",
      "from-purple-900/60 to-black",
      "from-amber-900/60 to-black",
      "from-cyan-900/60 to-black"
    ];

    mappedProducts.push({
      id: String(rawP.id),
      title: rawP.title || `${productTeam} Apparel`,
      name: rawP.title || `${productTeam} Apparel`,
      price: price,
      priceNum: priceVal,
      league: productLeague,
      team: productTeam,
      type: productType,
      category: category,
      image: rawP.images?.find((img: any) => img.src && img.src.trim() !== "")?.src || rawP.images?.[0]?.src || "",
      imageColor: gradients[i % gradients.length],
      description: rawP.description || `Official ${productTeam} Printify apparel.`,
      source: "printify" as const,
      printifyId: String(rawP.id),
      variantId: rawP.variants && rawP.variants.length > 0 ? rawP.variants[0].id : null,
      variants: rawP.variants || [],
      options: rawP.options || []
    });
  }

  return mappedProducts;
}
