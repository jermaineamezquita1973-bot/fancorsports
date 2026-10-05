import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Award, Sparkles, HelpCircle, ArrowRight, Activity, Flame } from "lucide-react";
import { Message } from "../types";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromo: () => void; // Can trigger coupon application
  onFilterLeague: (league: string) => void; // Can filter store league
}

export default function ChatDrawer({
  isOpen,
  onClose,
  onApplyPromo,
  onFilterLeague,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with Coach Cor's welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "bot",
          text: "🏀 Welcome to the Locker Room! Coach Cor here. I coach the styling squad at FANCOR ICONZ.",
          timestamp: new Date(),
        },
        {
          id: "welcome-2",
          sender: "bot",
          text: "Whether you need to unlock the ICONZ20 coupon code, double check our ultra-fast delivery policies, look up jersey sizing guides, or check out our orange WNBA All-Star collection—I got your back! What sports gear are we hunting for today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate Coach Cor's smart sports response
    setTimeout(() => {
      setIsTyping(false);
      const botReplyText = generateCoachResponse(textToSend);
      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: botReplyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 850);
  };

  const generateCoachResponse = (input: string): string => {
    const text = input.toLowerCase();

    if (text.includes("size") || text.includes("sizing") || text.includes("fit")) {
      return "📏 SIZING CHART UPDATE:\nOur Game Jerseys run in an 'Athletic Flat-Back Fit' (slightly tailored, standard shoulder cuts). For a relaxed streetwear style over a hoodie, we recommend going ONE SIZE UP. Hoodies are pre-shrunk premium heavy fleece and fit true-to-size!";
    }

    if (text.includes("shipping") || text.includes("deliver") || text.includes("post") || text.includes("truck")) {
      return "🚚 TEAM DISPATCH SHIPPING METRICS:\n- Standard Delivery ($5.99): 3 to 5 business days. FREE on orders of $75 or more!\n- Expedited Delivery ($14.99): 1 to 2 business days.\nWe process all orders from our midwest logistics hub in under 24 hours. No delays, purely green lights!";
    }

    if (text.includes("coupon") || text.includes("discount") || text.includes("code") || text.includes("promo") || text.includes("sale")) {
      onApplyPromo(); // Trigger callback
      return "⚡ BOOM! SQUAD DISCOUNT ACTIVATED!\nI've automatically applied coupon code 'ICONZ20' to your cart, slicing a full 20% OFF your entire apparel order! Go rack up those points in the checkout page!";
    }

    if (text.includes("wnba") || text.includes("orange") || text.includes("women")) {
      onFilterLeague("WNBA");
      // Scroll to the collection
      setTimeout(() => {
        const el = document.getElementById("shop-by-collection");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return "🏀 WNBA FOCUS:\nSuperb choice! The WNBA Orange Emblem Tee and Crop Hoodie are absolutely taking off this season. I have updated the collections grid below to showcase our full WNBA collection instantly! Go check them out.";
    }

    if (text.includes("nfl") || text.includes("football")) {
      onFilterLeague("NFL");
      return "🏈 NFL GRIDIRON GEAR:\nGot you! I've loaded up the NFL premium heavyweights below. Check out the Gridiron Heavyweight Hoodie—it is a tailgating masterpiece.";
    }

    if (text.includes("nba") || text.includes("basketball")) {
      onFilterLeague("NBA");
      return "🏀 NBA COURT CLASSICS:\nOn it! NBA selections are active below. The Hardwood Classic Swingman Jersey is embroidered with premium tackle-twill stitching. High durability, full comfort.";
    }

    if (text.includes("return") || text.includes("refund") || text.includes("exchange")) {
      return "🔄 HASSLE-FREE RETURNS POLICY:\nSportsmanship first! We offer full 30-day hassle-free returns or size exchanges on all unworn items with original tags. Just ping support and we'll send a prepaid shipping label in seconds.";
    }

    return "💪 Coach Cor's Rule: Focus, drive, and great gear! Tell me if you need help with Coupon Codes (use ICONZ20!), sizing specs, shipping rates, or return steps. I can also instantly filter the apparel catalog below for NFL, NBA, WNBA, MLB, NHL or MLS!";
  };

  const PRESET_TOPICS = [
    { label: "⚡ Activate 20% OFF Coupon", text: "Please apply the ICONZ20 coupon" },
    { label: "📏 Jersey Sizing Guide", text: "What is the sizing fit guide for jerseys?" },
    { label: "🚚 Shipping Policy & Rates", text: "What are your shipping rates and speeds?" },
    { label: "🏀 Filter WNBA Collection", text: "Show me the WNBA collection" },
    { label: "🔄 Returns & Exchanges", text: "How do returns and size exchanges work?" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Chat Window Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col shadow-2xl select-none"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 relative">
                  <Flame className="w-5 h-5 text-blue-400 animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></span>
                </div>
                <div>
                  <h2 className="text-white text-sm font-black tracking-widest uppercase flex items-center gap-1.5">
                    Coach Cor <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-normal">ASSISTANT</span>
                  </h2>
                  <span className="text-emerald-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5" /> ONLINE & READY
                  </span>
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

            {/* Scrollable message content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none font-medium"
                        : "bg-zinc-900 text-zinc-300 rounded-bl-none border border-zinc-850 whitespace-pre-line"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-850 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested preset topics */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/60 space-y-2">
              <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold block px-1">Suggested Coach Topics:</span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {PRESET_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(topic.text)}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 text-zinc-300 text-[10.5px] px-3 py-1.5 rounded-lg transition-all text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span>{topic.label}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Footer */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Coach Cor about shipping, sizing, coupons..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                  className="flex-1 bg-zinc-900 border border-zinc-850 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-500 font-medium"
                />
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex-shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
