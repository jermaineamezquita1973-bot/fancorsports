import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  Trophy, 
  ChevronDown, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Disc,
  Music,
  Sliders
} from "lucide-react";
import { LEAGUE_DROP_DATA } from "./Navbar";

interface HeroImageSliderProps {
  activeLeague: string;
  activeTeam: string | null;
  onSelectLeague: (league: string) => void;
  onSelectTeam: (league: string, team: string) => void;
  onShopAll: () => void;
  onOpenDiscount: () => void;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

interface SlideData {
  id: number;
  image: string;
  videoUrl?: string;
  audioUrl?: string;
  audioTitle?: string;
  badge: string;
  titleTop: string;
  titleHighlight: string;
  subtitle: string;
  tagline: string;
  gradient: string;
}

const QUEEN_ANTHEM_URLS = [
  "/We%20Are%20The%20Champions.mp3",
  "/We Are The Champions.mp3",
  "https://archive.org/download/queen-we-are-the-champions_202008/Queen%20-%20We%20Are%20The%20Champions.mp3",
  "https://upload.wikimedia.org/wikipedia/commons/e/e4/Kevin_MacLeod_-_Action.ogg"
];

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/hero.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sports-stadium-lights-in-the-night-42864-large.mp4",
    badge: "PREMIUM ATHLETIC APPAREL",
    titleTop: "FANCOR",
    titleHighlight: "ICONZ",
    subtitle: "ALL SPORTS SHOWCASE",
    tagline: "WHERE FANDOM MEETS SPORTSMANSHIP",
    gradient: "from-blue-400 via-cyan-400 to-indigo-500",
  },
  {
    id: 2,
    image: "/nfl_championship.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-american-football-game-on-the-field-23583-large.mp4",
    audioUrl: "/We%20Are%20The%20Champions.mp3",
    audioTitle: "Queen — We Are The Champions",
    badge: "CHAMPIONSHIP SERIES • QUEEN ANTHEM",
    titleTop: "MOB",
    titleHighlight: "TIDES",
    subtitle: "OFFICIAL NFL CHAMPIONSHIP COLLECTION",
    tagline: "WE ARE THE CHAMPIONS • HEAVYWEIGHT FLEECE HOODIES & VINTAGE TACKLE-TWILL CUTS",
    gradient: "from-amber-400 via-yellow-400 to-orange-500",
  },
  {
    id: 3,
    image: "/court.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-basketball-ball-falling-into-the-basket-2081-large.mp4",
    badge: "COURTSIDE EXCLUSIVE",
    titleTop: "HARDWOOD",
    titleHighlight: "ELITE",
    subtitle: "NBA COURTSIDE APPAREL",
    tagline: "AUTHENTIC DROP-SHOULDER MESH JERSEYS & PRE-SHRUNK TEES",
    gradient: "from-purple-400 via-fuchsia-400 to-pink-500",
  },
  {
    id: 4,
    image: "/wnba.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-female-basketball-player-shooting-a-hoop-40299-large.mp4",
    badge: "LIMITED EDITION • BORN FREE",
    titleTop: "BORN",
    titleHighlight: "FREE",
    subtitle: "WNBA PRO EDITION",
    tagline: "EMPOWERING DESIGNS & CUSTOM COURTSIDE LOOKS CELEBRATING THE BOLD SPIRIT of WOMEN'S BASKETBALL",
    gradient: "from-orange-400 via-amber-300 to-yellow-500",
  },
  {
    id: 5,
    image: "/mlb.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-baseball-player-hitting-a-ball-40302-large.mp4",
    badge: "HERITAGE DROP • YANKEE MODE",
    titleTop: "YANKEE",
    titleHighlight: "MODE",
    subtitle: "MLB HERITAGE GEAR",
    tagline: "TIMELESS BASEBALL AESTHETICS & EMBROIDERED WOOL CAPS FOR THE ULTIMATE BRONX BOMBERS FAN",
    gradient: "from-emerald-400 via-teal-400 to-cyan-500",
  },
  {
    id: 6,
    image: "/Hockey.webp",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-ice-hockey-player-in-action-on-the-rink-40306-large.mp4",
    badge: "LIMITED RELEASE",
    titleTop: "STRIKE ON",
    titleHighlight: "ICE",
    subtitle: "NHL VINTAGE SWEATERS",
    tagline: "PREMIUM HEAVYWEIGHT HOCKEY SWEATERS & TACKLE-TWILL JACKETS",
    gradient: "from-sky-400 via-blue-400 to-cyan-500",
  },
  {
    id: 7,
    image: "/soccer_pitch.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-player-kicking-a-soccer-ball-40292-large.mp4",
    badge: "MATCH READY • SET THE MATCH ON FIRE",
    titleTop: "SET THE MATCH",
    titleHighlight: "ON FIRE",
    subtitle: "MLS & GLOBAL KITS",
    tagline: "BREATHABLE PERFORMANCE FABRICS BUILT FOR SUPREME MATCH DAY DEVOTION",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
  },
];

export function HeroImageSlider({
  activeLeague,
  activeTeam,
  onSelectLeague,
  onSelectTeam,
  onShopAll,
  onOpenDiscount,
  currentIndex: currentIndexProp,
  onIndexChange,
}: HeroImageSliderProps) {
  const [localIndex, setLocalIndex] = useState(0);
  const isControlled = currentIndexProp !== undefined;
  const currentIndex = isControlled ? currentIndexProp : localIndex;
  const setCurrentIndex = (val: number | ((prev: number) => number)) => {
    const nextIndex = typeof val === "function" ? val(currentIndex) : val;
    if (isControlled && onIndexChange) {
      onIndexChange(nextIndex);
    } else {
      setLocalIndex(nextIndex);
    }
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [musicUrlIndex, setMusicUrlIndex] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Handle slide timer (pause auto slide if user is on Slide 2 listening to Queen, or let it advance)
  useEffect(() => {
    if (!isPlaying) return;
    const duration = currentIndex === 1 && isMusicPlaying ? 16000 : 7000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, duration);
    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, isMusicPlaying]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.volume = musicVolume;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true);
          })
          .catch((err) => {
            console.warn("Audio play interrupted, trying fallback source:", err);
            // Try next fallback source
            setMusicUrlIndex((prev) => (prev + 1) % QUEEN_ANTHEM_URLS.length);
          });
      }
    }
  };

  const toggleVideoMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="relative w-full h-[88vh] min-h-[680px] overflow-hidden bg-zinc-950 select-none flex flex-col justify-between">
      {/* HIDDEN BACKGROUND AUDIO ENGINE FOR QUEEN'S "WE ARE THE CHAMPIONS" */}
      <audio
        ref={audioRef}
        src={QUEEN_ANTHEM_URLS[musicUrlIndex]}
        loop
        preload="auto"
        onEnded={() => setIsMusicPlaying(false)}
        onError={() => {
          if (musicUrlIndex < QUEEN_ANTHEM_URLS.length - 1) {
            setMusicUrlIndex(prev => prev + 1);
          }
        }}
      />

      {/* 1. BACKGROUND VIDEO & IMAGE SLIDER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${currentSlide.image}')` }}
        >
          {/* Dynamic Video background if available */}
          {currentSlide.videoUrl && (
            <video
              ref={videoRef}
              key={`video-${currentSlide.id}`}
              src={currentSlide.videoUrl}
              poster={currentSlide.image}
              autoPlay={isPlaying}
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* MULTI-LAYER CINEMATIC GRADIENT OVERLAYS */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 2. TOP SLIDER NAVIGATION CONTROLS */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
          <span className="text-[11px] font-mono font-bold text-zinc-400">
            SLIDE <span className="text-white">{String(currentIndex + 1).padStart(2, "0")}</span> / {String(SLIDES.length).padStart(2, "0")}
          </span>
          <div className="w-1 h-3 bg-zinc-700 rounded-full" />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer p-0.5 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 text-blue-400 animate-pulse" /> PAUSE
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" /> PLAY
              </>
            )}
          </button>
        </div>

        {/* TOP RIGHT CONTROLS: QUEEN ANTHEM BUTTON, DISCOUNT PILL & ARROWS */}
        <div className="flex items-center gap-3">
          {/* QUEEN ANTHEM FLOATING MUSIC PLAYER BUTTON */}
          <button
            onClick={toggleMusic}
            className={`flex items-center gap-2.5 px-3 md:px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all backdrop-blur-md cursor-pointer select-none ${
              isMusicPlaying
                ? "bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
                : currentIndex === 1
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400"
                : "bg-black/60 text-zinc-300 border-white/10 hover:border-amber-400/50 hover:text-white"
            }`}
            title="Toggle Queen - We Are The Champions"
          >
            <div
              className={`relative flex items-center justify-center ${isMusicPlaying ? "animate-spin" : ""}`}
              style={{ animationDuration: "4s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}
            >
              <Disc className="w-4 h-4 text-amber-400" />
              {isMusicPlaying && (
                <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              )}
            </div>

            <div className="flex flex-col items-start leading-none text-left font-sans">
              <span className="text-[7.5px] uppercase tracking-widest font-black text-amber-400/80">QUEEN ANTHEM</span>
              <span className="text-[10px] font-black mt-0.5 tracking-wide">
                {isMusicPlaying ? "We Are The Champions 🎵" : "Play Queen Anthem 🎵"}
              </span>
            </div>

            {isMusicPlaying && (
              <div className="flex items-end gap-[2px] h-3 ml-1">
                <span className="w-[2px] bg-amber-400 animate-[pulse_0.6s_infinite_alternate]" style={{ height: "60%" }} />
                <span className="w-[2px] bg-amber-400 animate-[pulse_0.4s_infinite_alternate]" style={{ height: "100%" }} />
                <span className="w-[2px] bg-amber-400 animate-[pulse_0.8s_infinite_alternate]" style={{ height: "40%" }} />
              </div>
            )}
          </button>

          {/* Video Mute Toggle */}
          <button
            onClick={toggleVideoMute}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 hover:border-blue-400/50 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shadow-lg"
            title={isMuted ? "Unmute Background Video" : "Mute Background Video"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Discount Reminder Pill */}
          <button
            onClick={onOpenDiscount}
            className="group relative hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#03a9f4] to-blue-600 hover:from-[#03bbf4] hover:to-blue-500 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-full cursor-pointer border border-[#03a9f4]/30 shadow-lg shadow-[#03a9f4]/20 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: "4s" }} />
            <span>CLAIM 20% OFF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 hover:border-blue-400/50 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 hover:border-blue-400/50 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CENTER HERO CONTENT */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] md:text-xs px-4 py-1 rounded-full font-black tracking-widest uppercase shadow-md backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
                {currentSlide.badge}
              </span>

              {currentIndex === 1 && (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] md:text-xs px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-md backdrop-blur-sm">
                  <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                  QUEEN ANTHEM TRACK
                </span>
              )}
            </div>

            <h1 className="text-white text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-[0.2em] uppercase leading-none drop-shadow-2xl">
              {currentSlide.titleTop}{" "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentSlide.gradient}`}>
                {currentSlide.titleHighlight}
              </span>
            </h1>

            <div className="space-y-1">
              <p className="text-zinc-300 text-xs sm:text-sm md:text-base font-extrabold tracking-[0.25em] uppercase">
                {currentSlide.subtitle}
              </p>
              <p className="text-blue-400 text-xs sm:text-sm md:text-lg tracking-widest font-bold uppercase max-w-2xl mx-auto opacity-90">
                {currentSlide.tagline}
              </p>
            </div>

            {/* Special Callout Button for Slide 2 (Championship & Queen Anthem) */}
            {currentIndex === 1 && (
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={toggleMusic}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black px-6 py-2.5 rounded-full font-black text-xs tracking-widest uppercase shadow-xl shadow-amber-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-yellow-300/40 animate-bounce"
                >
                  <Music className="w-4 h-4 text-black" />
                  {isMusicPlaying ? "PAUSE WE ARE THE CHAMPIONS 🎵" : "PLAY WE ARE THE CHAMPIONS 🎵"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. BOTTOM BAR: ACTION TRIGGERS & 6 THUMBNAIL INDICATORS */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-8 space-y-6">
        {/* LEAGUE BUTTONS & TEAMS DROPDOWN */}
        <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3">
          <button
            onClick={onShopAll}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-2.5 rounded-full font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-600/25 active:scale-95 transition-all cursor-pointer shrink-0 border border-blue-400/30"
          >
            SHOP ALL GEAR
          </button>

          {/* Discount Reminder Action Button */}
          <button
            onClick={onOpenDiscount}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white px-5 py-2.5 rounded-full font-black text-xs tracking-wider uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0 border border-amber-400/30 flex items-center gap-1.5 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            GET 20% OFF REMINDER
          </button>

          {["NFL", "NBA", "WNBA", "MLB", "NHL", "MLS"].map((league) => (
            <button
              key={league}
              onClick={() => onSelectLeague(league)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold tracking-wider backdrop-blur transition-all active:scale-95 cursor-pointer uppercase ${
                activeLeague === league
                  ? "bg-blue-500 text-white border border-blue-400 shadow-md shadow-blue-500/20"
                  : "bg-black/50 hover:bg-black/80 text-zinc-200 border border-white/10 hover:border-white/20"
              }`}
            >
              {league}
            </button>
          ))}

          {/* Teams Dropdown */}
          <div className="relative inline-block select-none">
            <select
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === "ALL") {
                  onSelectLeague("ALL");
                } else {
                  const [lg, teamName] = selectedValue.split("::");
                  onSelectTeam(lg, teamName);
                }
              }}
              value={activeTeam ? `${activeLeague}::${activeTeam}` : "ALL"}
              className="bg-black/80 hover:bg-black/90 backdrop-blur-md border border-zinc-800 hover:border-blue-400 text-white px-5 py-2.5 pr-10 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-300 appearance-none cursor-pointer shadow-lg shadow-black/80 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="ALL" className="bg-zinc-950 text-white font-bold">
                ALL TEAMS DROPDOWN
              </option>
              {Object.keys(LEAGUE_DROP_DATA).map((lg) => {
                const data = LEAGUE_DROP_DATA[lg as keyof typeof LEAGUE_DROP_DATA];
                const allTeamsInLeague = data.divisions
                  .flatMap((div) => div.teams)
                  .sort((a, b) => a.localeCompare(b));

                return (
                  <optgroup key={lg} label={`${lg} TEAMS`} className="bg-zinc-950 text-blue-400 font-extrabold font-mono">
                    {allTeamsInLeague.map((team) => (
                      <option key={team} value={`${lg}::${team}`} className="bg-zinc-900 text-white font-medium">
                        {team}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-400">
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        </div>

        {/* 7 IMAGE / VIDEO SLIDER PROGRESS / DOT INDICATORS */}
        <div className="grid grid-cols-7 gap-2 pt-3 border-t border-white/10 max-w-2xl mx-auto">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                className="group relative flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer py-1"
              >
                {/* PROGRESS LINE */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden transition-all duration-300">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isActive ? "w-full bg-[#00D2FF] shadow-[0_0_10px_#00D2FF]" : "w-0 group-hover:w-1/2 bg-zinc-500"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9px] font-mono tracking-wider font-extrabold transition-colors ${
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {String(slide.id).padStart(2, "0")}
                  </span>
                  {idx === 1 && (
                    <Trophy className={`w-2.5 h-2.5 ${isActive ? "text-yellow-400 animate-bounce" : "text-yellow-600/70"}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

