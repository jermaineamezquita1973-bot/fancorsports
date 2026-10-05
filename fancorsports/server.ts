import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

const MOCK_TEAMS: { league: string; team: string }[] = [
  // NFL (33 teams)
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

  // MLS (30 teams)
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

const LEAGUE_IMAGES: Record<string, string> = {
  NFL: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
  NBA: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
  WNBA: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600",
  MLB: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
  MLS: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600"
};

const MOCK_PRINTIFY_PRODUCTS = MOCK_TEAMS.map((item, idx) => {
  const baseId = 23199120 + idx;
  const image = LEAGUE_IMAGES[item.league] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600";
  return {
    id: String(baseId),
    title: `${item.team} Unisex Cotton Tee - FanCor Signature Edition`,
    description: `Official ${item.team} Printify apparel. Premium heavy-weight cotton t-shirt built for sports fans. Authentic ${item.league} team design featuring high-resolution printed logo graphics and regular retail fit.`,
    tags: [item.league.toLowerCase(), item.team.toLowerCase(), "tee", "t-shirt", "apparel"],
    variants: [
      {
        id: baseId * 10,
        price: 3000,
        title: "S / Black"
      },
      {
        id: baseId * 10 + 1,
        price: 3000,
        title: "M / Black"
      },
      {
        id: baseId * 10 + 2,
        price: 3000,
        title: "L / Black"
      },
      {
        id: baseId * 10 + 3,
        price: 3000,
        title: "XL / Black"
      }
    ],
    images: [
      {
        src: image
      }
    ],
    options: [
      {
        name: "Size",
        type: "size",
        values: ["S", "M", "L", "XL"]
      }
    ]
  };
});

dotenv.config();

function cleanEnv(val?: string) {
  if (!val) return undefined;
  let s = val.trim();
  if (s.startsWith("Bearer ")) s = s.slice(7).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s || undefined;
}

export const app = express();
const PORT = 3000;

// JSON parsing middleware
app.use(express.json());

async function startServer() {
  // API Route for Printify Connection setup
  app.get("/api/fulfillment/setup", async (req, res) => {
    try {
      const apiKey = cleanEnv(req.headers["x-printify-api-key"] as string) || cleanEnv(process.env.PRINTIFY_API_KEY);
      if (!apiKey) {
        return res.status(400).json({ 
          error: "PRINTIFY_API_KEY is not configured. Please configure it in the Admin Settings panel or the Settings > Secrets panel of Google AI Studio." 
        });
      }

      const response = await fetch("https://api.printify.com/v1/shops.json", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "User-Agent": "aistudio-build-helper"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Printify setup response status ${response.status}`);
        return res.status(response.status).json({ 
          error: `Printify API returned error (${response.status}): ${errorText || response.statusText}` 
        });
      }

      const shops = await response.json();
      res.json({ shops });
    } catch (err: any) {
      console.log(`Printify setup endpoint failure: ${err.message}`);
      res.status(500).json({ error: `Server error connecting to Printify: ${err.message}` });
    }
  });

  // API Route to write Printify secrets directly to server-side .env and memory
  app.post("/api/fulfillment/save-secrets", async (req, res) => {
    try {
      const { apiKey, shopId } = req.body;
      const cleanKey = (apiKey || "").trim();
      const cleanShop = (shopId || "").trim();

      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      const lines = envContent.split("\n");
      let updatedApiKey = false;
      let updatedShopId = false;

      let newLines = lines.map(line => {
        if (line.trim().startsWith("PRINTIFY_API_KEY=")) {
          updatedApiKey = true;
          return `PRINTIFY_API_KEY=${cleanKey}`;
        }
        if (line.trim().startsWith("PRINTIFY_SHOP_ID=")) {
          updatedShopId = true;
          return `PRINTIFY_SHOP_ID=${cleanShop}`;
        }
        return line;
      });

      if (!updatedApiKey) {
        newLines.push(`PRINTIFY_API_KEY=${cleanKey}`);
      }
      if (!updatedShopId) {
        newLines.push(`PRINTIFY_SHOP_ID=${cleanShop}`);
      }

      // Filter out empty lines at the end
      fs.writeFileSync(envPath, newLines.join("\n").trim() + "\n", "utf-8");

      // Apply in memory immediately
      if (cleanKey) process.env.PRINTIFY_API_KEY = cleanKey;
      if (cleanShop) process.env.PRINTIFY_SHOP_ID = cleanShop;

      console.log(`Successfully saved Printify API Key (length: ${cleanKey.length}) and Shop ID (${cleanShop}) to server-side secrets.`);
      res.json({ success: true, message: "Secrets successfully saved to server .env and activated in-memory." });
    } catch (err: any) {
      console.error("Failed to save secrets on server:", err);
      res.status(500).json({ error: "Failed to save secrets to server configuration", details: err.message });
    }
  });

  // API Route for Printify Products (List and Delete)
  app.get("/api/products", async (req, res) => {
    try {
      const apiKey = cleanEnv(req.headers["x-printify-api-key"] as string) || cleanEnv(process.env.PRINTIFY_API_KEY);
      const shopId = cleanEnv(req.headers["x-printify-shop-id"] as string) || cleanEnv(process.env.PRINTIFY_SHOP_ID) || "23199113";

      if (!apiKey || apiKey === "23199113" || apiKey === shopId || apiKey.length < 20) {
        return res.status(400).json({
          error: "Printify API Key is missing or invalid.",
          message: "Please enter a valid Printify API key in the Admin Panel or server environment variables."
        });
      }

      // Auto-resolve Shop ID if it is the placeholder or empty
      let resolvedShopId = shopId;
      if (!resolvedShopId || resolvedShopId === "23199113") {
        try {
          const shopsResponse = await fetch("https://api.printify.com/v1/shops.json", {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "User-Agent": "aistudio-build-helper"
            }
          });
          if (shopsResponse.ok) {
            const shops = await shopsResponse.json();
            if (Array.isArray(shops) && shops.length > 0) {
              resolvedShopId = String(shops[0].id);
              console.log(`Auto-resolved Printify Shop ID to ${resolvedShopId}`);
            }
          }
        } catch (shopErr: any) {
          console.error("Failed to auto-resolve Printify shop ID:", shopErr.message);
        }
      }

      // Construct Printify request URL with forwarded pagination query parameters
      const urlParams = new URLSearchParams();
      if (req.query.page) urlParams.append("page", String(req.query.page));
      if (req.query.limit) urlParams.append("limit", String(req.query.limit));
      const queryString = urlParams.toString() ? `?${urlParams.toString()}` : "";

      // Fetch from Printify API
      const response = await fetch(`https://api.printify.com/v1/shops/${resolvedShopId}/products.json${queryString}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "User-Agent": "aistudio-build-helper"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          console.warn(`Printify API Key is invalid or expired. Operating in Mock Fallback mode.`);
        } else {
          console.warn(`Printify API fetch returned status ${response.status}: ${errorText}`);
        }
        return res.status(response.status).json({
          error: `Printify API returned an error (${response.status})`,
          details: errorText || response.statusText
        });
      }

      const data = await response.json();
      const productList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : (data.products || []));
      res.json({
        ...data,
        products: productList,
        resolved_shop_id: resolvedShopId
      });
    } catch (err: any) {
      console.log(`Printify get products endpoint failure: ${err.message}`);
      res.status(500).json({
        error: "Server error retrieving Printify products",
        details: err.message
      });
    }
  });

  app.delete("/api/products", async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "productId is required" });
      }

      const apiKey = cleanEnv(req.headers["x-printify-api-key"] as string) || cleanEnv(process.env.PRINTIFY_API_KEY);
      const shopId = cleanEnv(req.headers["x-printify-shop-id"] as string) || cleanEnv(process.env.PRINTIFY_SHOP_ID) || "23199113";

      if (!apiKey || apiKey === "23199113" || apiKey === shopId || apiKey.length < 20) {
        return res.status(400).json({ error: "Printify API Key is missing or invalid." });
      }

      // Auto-resolve Shop ID if it is the placeholder or empty
      let resolvedShopId = shopId;
      if (!resolvedShopId || resolvedShopId === "23199113") {
        try {
          const shopsResponse = await fetch("https://api.printify.com/v1/shops.json", {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "User-Agent": "aistudio-build-helper"
            }
          });
          if (shopsResponse.ok) {
            const shops = await shopsResponse.json();
            if (Array.isArray(shops) && shops.length > 0) {
              resolvedShopId = String(shops[0].id);
              console.log(`Auto-resolved Printify Shop ID to ${resolvedShopId}`);
            }
          }
        } catch (shopErr: any) {
          console.error("Failed to auto-resolve Printify shop ID:", shopErr.message);
        }
      }

      const response = await fetch(`https://api.printify.com/v1/shops/${resolvedShopId}/products/${productId}.json`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "User-Agent": "aistudio-build-helper"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          console.warn(`Printify API Key is invalid or expired. Operating in Mock Fallback mode.`);
        } else {
          console.warn(`Printify API delete product ${productId} failed with status ${response.status}`);
        }
        return res.status(response.status).json({
          error: `Printify API delete failed (${response.status})`,
          details: errorText || response.statusText
        });
      }

      res.json({ success: true });
    } catch (err: any) {
      console.log(`Printify delete product endpoint failure: ${err.message}`);
      res.status(500).json({ error: "Server error deleting Printify product", details: err.message });
    }
  });

  // API Route for secure Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: "👋 Hi! I'm your FanCor Iconz AI assistant. It looks like the GEMINI_API_KEY is not configured yet. Once the key is configured in the Settings > Secrets panel, I will be fully functional to assist you with products, sizes, and shipping!"
        });
      }

      // Lazy initialization of the modern @google/genai SDK on the server-side
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `You are a helpful and enthusiastic AI assistant for FanCor Iconz, a fan-inspired merchandise store. 
Your goal is to help customers find gear, answer questions about products, and provide shipping/return information.

Key Store Info:
- Store Name: FanCor Iconz
- Products: T-shirts ($30), Hoodies ($60), Jerseys, Accessories.
- Leagues: NFL, NBA, WNBA, MLB, NHL, MLS.
- Shipping: Standard ($5.99, 5-7 days), Expedited ($14.99, 2-3 days), Free over $75.
- Returns: 30-day hassle-free returns.
- Tone: Professional, sports-loving, and helpful.

Keep responses concise and friendly. If you don't know an answer, suggest they contact support at support@fancoriconz.com.`,
        },
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (err: any) {
      console.warn("Gemini server error:", err);
      res.status(500).json({ error: "Sorry, I had an error processing that message. Please try again." });
    }
  });

  // --- STRIPE CHECKOUT INTEGRATION ENDPOINTS ---

  // Endpoint to check Stripe configuration status and return public key
  app.get("/api/checkout/config", (req, res) => {
    const publishableKey = cleanEnv(process.env.VITE_STRIPE_PUBLISHABLE_KEY) || cleanEnv(process.env.STRIPE_PUBLISHABLE_KEY);
    res.json({
      stripeConfigured: !!cleanEnv(process.env.STRIPE_SECRET_KEY),
      publishableKey: publishableKey || ""
    });
  });

  // Endpoint to save Stripe keys dynamically from client UI
  app.post("/api/checkout/save-keys", async (req, res) => {
    try {
      const { secretKey, publishableKey } = req.body;
      const cleanSecret = (secretKey || "").trim();
      const cleanPublishable = (publishableKey || "").trim();

      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      const lines = envContent.split("\n");
      let updatedSecret = false;
      let updatedPublishable = false;

      let newLines = lines.map(line => {
        if (line.trim().startsWith("STRIPE_SECRET_KEY=")) {
          updatedSecret = true;
          return `STRIPE_SECRET_KEY=${cleanSecret}`;
        }
        if (line.trim().startsWith("VITE_STRIPE_PUBLISHABLE_KEY=")) {
          updatedPublishable = true;
          return `VITE_STRIPE_PUBLISHABLE_KEY=${cleanPublishable}`;
        }
        return line;
      });

      if (!updatedSecret) {
        newLines.push(`STRIPE_SECRET_KEY=${cleanSecret}`);
      }
      if (!updatedPublishable) {
        newLines.push(`VITE_STRIPE_PUBLISHABLE_KEY=${cleanPublishable}`);
      }

      fs.writeFileSync(envPath, newLines.join("\n").trim() + "\n", "utf-8");

      // Apply in-memory immediately
      if (cleanSecret) process.env.STRIPE_SECRET_KEY = cleanSecret;
      if (cleanPublishable) {
        process.env.VITE_STRIPE_PUBLISHABLE_KEY = cleanPublishable;
        process.env.STRIPE_PUBLISHABLE_KEY = cleanPublishable;
      }

      console.log("Stripe API Keys saved and activated in-memory successfully.");
      res.json({ success: true, message: "Stripe API keys successfully saved and activated in-memory." });
    } catch (err: any) {
      console.error("Failed to save Stripe keys:", err);
      res.status(500).json({ error: "Failed to save keys to configuration", details: err.message });
    }
  });

  // Create Checkout Session
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      const { cartItems, couponCode, shippingMethod } = req.body;
      
      const secretKey = cleanEnv(process.env.STRIPE_SECRET_KEY);
      if (!secretKey) {
        return res.status(400).json({
          error: "STRIPE_SECRET_KEY is not configured on the server. Please enter your Stripe keys in the Admin Settings panel or add them to the Settings > Secrets menu."
        });
      }

      // Helper to safely parse any format of product price
      const parsePrice = (price: any): number => {
        if (typeof price === "number") return price;
        if (!price) return 0;
        const cleaned = String(price).replace(/[^0-9.]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      // Calculate discount rate
      const discountRate = (couponCode || "").trim().toUpperCase() === "ICONZ20" ? 0.20 : 0;

      // Lazy-load Stripe
      const stripe = new Stripe(secretKey, {
        apiVersion: "2023-10-16" as any
      });

      // Prepare line items
      const line_items = cartItems.map((item: any) => {
        const originalPrice = parsePrice(item.product.price);
        const finalPrice = discountRate > 0 ? originalPrice * (1 - discountRate) : originalPrice;
        const priceInCents = Math.round(finalPrice * 100);

        let itemDesc = item.product.description || `Official ${item.product.team || ""} ${item.product.category}`;
        if (discountRate > 0) {
          itemDesc = `[20% OFF ICONZ VIP CODE APPLIED] ${itemDesc}`;
        }

        const imageUrls = [];
        if (item.product.image) {
          imageUrls.push(item.product.image);
        }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.product.team ? `${item.product.team} ` : ""}${item.product.name || item.product.title || item.product.category}`,
              description: itemDesc,
              images: imageUrls.length > 0 ? imageUrls : undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: Number(item.quantity) || 1,
        };
      });

      // Calculate discounted subtotal to verify shipping threshold
      const subtotal = cartItems.reduce((acc: number, item: any) => acc + parsePrice(item.product.price) * (Number(item.quantity) || 1), 0);
      const discountedSubtotal = subtotal * (1 - discountRate);

      // Determine shipping cost
      const freeShippingThreshold = 75;
      const isFreeShipping = discountedSubtotal >= freeShippingThreshold && shippingMethod === "standard";
      const shippingCost = isFreeShipping
        ? 0
        : shippingMethod === "standard"
          ? 5.99
          : 14.99;

      if (shippingCost > 0) {
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${shippingMethod === "expedited" ? "Expedited" : "Standard"} Shipping`,
              description: "Delivery fee for your apparel order.",
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        });
      }

      const origin = req.headers.origin || `http://localhost:3000`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${origin}?checkout_status=success`,
        cancel_url: `${origin}?checkout_status=cancel`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      console.error("Stripe session creation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development vs static asset serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
