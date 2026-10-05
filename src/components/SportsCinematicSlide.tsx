import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Volume1, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles, Trophy, ShoppingBag, Eye, Disc, Music, Sliders, AlertCircle, RefreshCw } from "lucide-react";

interface TeamItem {
  name: string;
  short: string;
  imageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
}

interface SportsSlide {
  id: string;
  league: string;
  sport: string;
  title: string;
  tagline: string;
  videoUrl: string;
  posterUrl: string;
  accentColor: string;
  badgeColor: string;
  featuredTeams: TeamItem[];
}

const SPORTS_SLIDES: SportsSlide[] = [
  {
    id: "all",
    league: "FANCOR",
    sport: "All Sports Showcase",
    title: "Fancor Iconz",
    tagline: "Where fandom meets sportsmanship with high-contrast performance streetwear.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sports-stadium-lights-in-the-night-42864-large.mp4",
    posterUrl: "/hero.jpg",
    accentColor: "from-blue-600/40 via-blue-950/20 to-[#03060b]",
    badgeColor: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    featuredTeams: [
      {
        name: "Dallas Cowboys",
        short: "DAL",
        imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#002244",
        secondaryColor: "#B0B7BC",
        badgeBg: "bg-slate-900 border-slate-700 text-white"
      },
      {
        name: "Los Angeles Lakers",
        short: "LAL",
        imageUrl: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#552583",
        secondaryColor: "#FDB927",
        badgeBg: "bg-fuchsia-950 border-fuchsia-700 text-fuchsia-200"
      },
      {
        name: "New York Yankees",
        short: "NYY",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#0C2340",
        secondaryColor: "#C4CED4",
        badgeBg: "bg-slate-900 border-slate-700 text-white"
      }
    ]
  },
  {
    id: "nfl",
    league: "NFL",
    sport: "Professional Football",
    title: "Mob Tides",
    tagline: "Classic heavy fleece hoodies and game day cuts designed for pure stadium impact and street-side style.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-american-football-game-on-the-field-23583-large.mp4",
    posterUrl: "/Front, Solid Midnight Navy.jpg",
    accentColor: "from-blue-600/40 via-blue-950/20 to-[#03060b]",
    badgeColor: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    featuredTeams: [
      {
        name: "Dallas Cowboys",
        short: "DAL",
        imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#002244",
        secondaryColor: "#B0B7BC",
        badgeBg: "bg-slate-900 border-slate-700 text-white"
      },
      {
        name: "Kansas City Chiefs",
        short: "KC",
        imageUrl: "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#E31837",
        secondaryColor: "#FFB612",
        badgeBg: "bg-red-950 border-red-700 text-red-200"
      },
      {
        name: "San Francisco 49ers",
        short: "SF",
        imageUrl: "https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#AA0000",
        secondaryColor: "#B3995D",
        badgeBg: "bg-amber-950 border-amber-700 text-amber-200"
      },
      {
        name: "Miami Dolphins",
        short: "MIA",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#008E97",
        secondaryColor: "#FC4C02",
        badgeBg: "bg-teal-950 border-teal-700 text-teal-200"
      },
      {
        name: "Green Bay Packers",
        short: "GB",
        imageUrl: "https://images.unsplash.com/photo-1511140594119-9f79883652f0?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#203731",
        secondaryColor: "#FFB612",
        badgeBg: "bg-emerald-950 border-emerald-700 text-emerald-200"
      }
    ]
  },
  {
    id: "nba",
    league: "NBA",
    sport: "Professional Basketball",
    title: "Concrete Jungle",
    tagline: "Heavyweight drop-shoulder styles and retro-cut jerseys engineered for the asphalt and the arena.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-basketball-ball-falling-into-the-basket-2081-large.mp4",
    posterUrl: "/Front, Solid Black.jpg",
    accentColor: "from-purple-600/40 via-purple-950/20 to-[#03060b]",
    badgeColor: "bg-purple-600/20 text-purple-400 border-purple-500/30",
    featuredTeams: [
      {
        name: "Los Angeles Lakers",
        short: "LAL",
        imageUrl: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#552583",
        secondaryColor: "#FDB927",
        badgeBg: "bg-fuchsia-950 border-fuchsia-700 text-fuchsia-200"
      },
      {
        name: "Boston Celtics",
        short: "BOS",
        imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#007A33",
        secondaryColor: "#BA9653",
        badgeBg: "bg-emerald-950 border-emerald-700 text-emerald-200"
      },
      {
        name: "Golden State Warriors",
        short: "GSW",
        imageUrl: "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#1D428A",
        secondaryColor: "#FFC72C",
        badgeBg: "bg-blue-950 border-blue-700 text-blue-200"
      },
      {
        name: "Chicago Bulls",
        short: "CHI",
        imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#CE1141",
        secondaryColor: "#000000",
        badgeBg: "bg-red-950 border-red-700 text-red-200"
      },
      {
        name: "Miami Heat",
        short: "MIA",
        imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#98002E",
        secondaryColor: "#F9A01B",
        badgeBg: "bg-rose-950 border-rose-700 text-rose-200"
      }
    ]
  },
  {
    id: "wnba",
    league: "WNBA",
    sport: "Women's Pro Basketball",
    title: "Born Free",
    tagline: "Empowering designs and custom courtside looks celebrating the bold spirit of women's basketball culture.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-female-basketball-player-shooting-a-hoop-40299-large.mp4",
    posterUrl: "/Front, Solid Cool Blue.jpg",
    accentColor: "from-orange-600/40 via-orange-950/20 to-[#03060b]",
    badgeColor: "bg-orange-600/20 text-orange-400 border-orange-500/30",
    featuredTeams: [
      {
        name: "Las Vegas Aces",
        short: "LVA",
        imageUrl: "https://images.unsplash.com/photo-1592819695396-064b95e2a660?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#000000",
        secondaryColor: "#C29B38",
        badgeBg: "bg-zinc-950 border-zinc-700 text-zinc-100"
      },
      {
        name: "New York Liberty",
        short: "NYL",
        imageUrl: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#86CEBC",
        secondaryColor: "#000000",
        badgeBg: "bg-teal-950 border-teal-700 text-teal-200"
      },
      {
        name: "Indiana Fever",
        short: "IND",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#0C2340",
        secondaryColor: "#C1D3E2",
        badgeBg: "bg-blue-950 border-blue-700 text-blue-200"
      },
      {
        name: "Seattle Storm",
        short: "SEA",
        imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#004F2F",
        secondaryColor: "#FBE122",
        badgeBg: "bg-emerald-950 border-emerald-700 text-emerald-200"
      },
      {
        name: "Chicago Sky",
        short: "CHI",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#002B49",
        secondaryColor: "#84AD9B",
        badgeBg: "bg-cyan-950 border-cyan-700 text-cyan-200"
      }
    ]
  },
  {
    id: "mlb",
    league: "MLB",
    sport: "Professional Baseball",
    title: "Yankee Mode",
    tagline: "Classic button-down baseball flannels and retro-inspired warmups loaded with historic franchise heritage.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-baseball-player-hitting-a-ball-40302-large.mp4",
    posterUrl: "/Front, Solid Black copy.jpg",
    accentColor: "from-indigo-900/40 via-slate-950/20 to-[#03060b]",
    badgeColor: "bg-indigo-950/40 text-indigo-400 border-indigo-500/30",
    featuredTeams: [
      {
        name: "New York Yankees",
        short: "NYY",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#0C2340",
        secondaryColor: "#C4CED4",
        badgeBg: "bg-slate-900 border-slate-700 text-white"
      },
      {
        name: "Los Angeles Dodgers",
        short: "LAD",
        imageUrl: "/mlb.jpg",
        primaryColor: "#005A9C",
        secondaryColor: "#A5ACAF",
        badgeBg: "bg-blue-950 border-blue-700 text-blue-200"
      },
      {
        name: "Boston Red Sox",
        short: "BOS",
        imageUrl: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#BD3039",
        secondaryColor: "#0C2340",
        badgeBg: "bg-red-950 border-red-700 text-red-200"
      },
      {
        name: "Chicago Cubs",
        short: "CHC",
        imageUrl: "https://images.unsplash.com/photo-1435527173128-983b87201f4d?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#0E3386",
        secondaryColor: "#CC3433",
        badgeBg: "bg-sky-950 border-sky-700 text-sky-200"
      },
      {
        name: "San Francisco Giants",
        short: "SFG",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#FD5A1E",
        secondaryColor: "#27251F",
        badgeBg: "bg-orange-950 border-orange-700 text-orange-200"
      }
    ]
  },
  {
    id: "nhl",
    league: "NHL",
    sport: "Professional Hockey",
    title: "Strike on Ice",
    tagline: "Premium heavyweight hockey sweaters and vintage tackle-twill styles built to defeat the chill.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-ice-hockey-player-in-action-on-the-rink-40306-large.mp4",
    posterUrl: "/Front, Solid White.jpg",
    accentColor: "from-cyan-600/40 via-cyan-950/20 to-[#03060b]",
    badgeColor: "bg-cyan-600/20 text-cyan-400 border-cyan-500/30",
    featuredTeams: [
      {
        name: "New York Rangers",
        short: "NYR",
        imageUrl: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#0038A8",
        secondaryColor: "#CE1126",
        badgeBg: "bg-blue-950 border-blue-700 text-blue-200"
      },
      {
        name: "Boston Bruins",
        short: "BOS",
        imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#111111",
        secondaryColor: "#FFB81C",
        badgeBg: "bg-zinc-950 border-zinc-700 text-zinc-100"
      },
      {
        name: "Chicago Blackhawks",
        short: "CHI",
        imageUrl: "https://images.unsplash.com/photo-1580748141549-71748d60bdc5?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#CF0A2C",
        secondaryColor: "#000000",
        badgeBg: "bg-red-950 border-red-700 text-red-200"
      },
      {
        name: "Edmonton Oilers",
        short: "EDM",
        imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#041E42",
        secondaryColor: "#FF4C00",
        badgeBg: "bg-blue-950 border-blue-700 text-orange-300"
      },
      {
        name: "Vegas Golden Knights",
        short: "VGK",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#B4975A",
        secondaryColor: "#333f48",
        badgeBg: "bg-neutral-900 border-amber-600/40 text-amber-200"
      }
    ]
  },
  {
    id: "mls",
    league: "MLS",
    sport: "Professional Soccer",
    title: "Set the Match on Fire",
    tagline: "High-performance training kits and custom supporters' gear crafted for absolute club devotion.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-player-kicking-a-soccer-ball-40292-large.mp4",
    posterUrl: "/Front, Solid Red.jpg",
    accentColor: "from-red-600/40 via-red-950/20 to-[#03060b]",
    badgeColor: "bg-red-600/20 text-red-400 border-red-500/30",
    featuredTeams: [
      {
        name: "Inter Miami CF",
        short: "MIA",
        imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#F7B5CD",
        secondaryColor: "#231F20",
        badgeBg: "bg-pink-950/40 border-pink-500/30 text-pink-300"
      },
      {
        name: "LA Galaxy",
        short: "LAG",
        imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#00245D",
        secondaryColor: "#FFD200",
        badgeBg: "bg-blue-950 border-blue-700 text-blue-200"
      },
      {
        name: "Los Angeles FC",
        short: "LAFC",
        imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#000000",
        secondaryColor: "#C39C5E",
        badgeBg: "bg-zinc-950 border-zinc-700 text-zinc-100"
      },
      {
        name: "Seattle Sounders FC",
        short: "SEA",
        imageUrl: "https://images.unsplash.com/photo-1413752362258-7af2a667b590?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#5D9741",
        secondaryColor: "#002F6C",
        badgeBg: "bg-emerald-950 border-emerald-700 text-emerald-200"
      },
      {
        name: "Atlanta United FC",
        short: "ATL",
        imageUrl: "https://images.unsplash.com/photo-1489945052260-4f21e5216e25?q=80&w=200&auto=format&fit=crop",
        primaryColor: "#80000A",
        secondaryColor: "#221F1F",
        badgeBg: "bg-red-950 border-red-700 text-red-200"
      }
    ]
  }
];

const QUEEN_ANTHEM_URLS = [
  "/We%20Are%20The%20Champions.mp3",
  "https://archive.org/download/queen-we-are-the-champions_202008/Queen%20-%20We%20Are%20The%20Champions.mp3",
  "https://upload.wikimedia.org/wikipedia/commons/e/e4/Kevin_MacLeod_-_Action.ogg",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
];

function formatTime(secs: number) {
  if (isNaN(secs) || secs <= 0) return "0:00";
  const minutes = Math.floor(secs / 60);
  const remainingSeconds = Math.floor(secs % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

interface SportsCinematicSlideProps {
  onSelectLeague: (league: string) => void;
  onSelectTeam: (league: string, team: string) => void;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function SportsCinematicSlide({ 
  onSelectLeague, 
  onSelectTeam,
  currentIndex: currentIndexProp,
  onIndexChange,
}: SportsCinematicSlideProps) {
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
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Background audio engine for Queen's "We Are The Champions"
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [musicUrlIndex, setMusicUrlIndex] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isVolumePanelOpen, setIsVolumePanelOpen] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // Dynamically update actual audio element volume on state change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
      audioRef.current.muted = isMusicMuted;
    }
  }, [musicVolume, isMusicMuted]);

  const SLIDE_DURATION = 8000; // 8 seconds per slide to allow viewing teams
  const INTERVAL_STEP = 50; // update progress bar every 50ms

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle slide changing automatic timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setProgress(0);
    const totalSteps = SLIDE_DURATION / INTERVAL_STEP;
    let currentStep = 0;

    timerRef.current = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / totalSteps) * 100;
      setProgress(currentProgress);

      if (currentStep >= totalSteps) {
        handleNext();
      }
    }, INTERVAL_STEP);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPlaying]);

  // Sync autoplay status on source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      // Statically set defaultMuted on element to prevent browser locks
      videoRef.current.defaultMuted = true;
      
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Autoplay was prevented, showing poster fallback.", error);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, isMuted]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SPORTS_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SPORTS_SLIDES.length) % SPORTS_SLIDES.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Direct music play/pause toggle
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      setAudioError(null);
      audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
      audioRef.current.muted = isMusicMuted;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((err) => {
        console.log("Audio play prevented by browser autoplay protection", err);
        setAudioError("Autoplay blocked! Click Play below to bypass browser security.");
      });
    }
  };

  // Sync mute controls: unmuting video also triggers the epic Queen stadium anthem!
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }

    if (audioRef.current) {
      if (!nextMuted) {
        // Unmuting video -> trigger Queen anthem
        audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
        audioRef.current.muted = isMusicMuted;
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
          setAudioError(null);
        }).catch((err) => {
          console.log("Theme song auto-play on unmute blocked", err);
        });
      } else {
        // Muting video -> pause Queen anthem
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };

  const rotateAnthemUrl = () => {
    const nextIndex = (musicUrlIndex + 1) % QUEEN_ANTHEM_URLS.length;
    setMusicUrlIndex(nextIndex);
    setIsAudioLoading(true);
    setAudioError(`Connecting to server mirror ${nextIndex + 1}...`);
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
        audioRef.current.muted = isMusicMuted;
        // Auto-play the fallback track
        audioRef.current.play()
          .then(() => {
            setIsMusicPlaying(true);
            setAudioError(null);
          })
          .catch((err) => {
            console.log("Failed to autoplay mirror swap", err);
            setAudioError("Mirror swapped! Click Play on the controller to listen.");
            setIsMusicPlaying(false);
          });
      }
    }, 200);
  };

  const currentSlide = SPORTS_SLIDES[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 select-none" id="sports-cinematic-reel">
      {/* SECTION HEADER */}
      <div className="flex flex-col items-center justify-center text-center mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 bg-[#03a9f4]/10 border border-[#03a9f4]/20 text-[#03a9f4] text-[10px] font-mono font-black tracking-[0.25em] uppercase px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#03a9f4]" />
          CINEMATIC STADIUM REEL
        </span>
        <h2 className="font-anton text-3xl md:text-5xl text-white uppercase tracking-wider">
          Official Sport Franchises
        </h2>
        <div className="h-0.5 w-16 bg-[#03a9f4] rounded-full" />
        <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-lg">
          Dive into premium curated apparel collections inspired by the core heartbeat of professional sports.
        </p>
      </div>

      {/* REEL THEATER COMPONENT */}
      <div className="relative aspect-[16/10] md:aspect-[2.35/1] w-full rounded-3xl overflow-hidden bg-[#03060b] border border-zinc-900 shadow-2xl group">
        
        {/* VIDEO DISPLAY CONTAINER */}
        <div className="absolute inset-0 w-full h-full bg-[#03060b]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Dynamic Video background with full fallback options */}
              <video
                ref={videoRef}
                src={currentSlide.videoUrl}
                poster={currentSlide.posterUrl}
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover scale-[1.02]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* HIGH-CONTRAST CINEMATIC GRADIENT MASKS */}
        <div className={`absolute inset-0 bg-gradient-to-t ${currentSlide.accentColor} transition-all duration-1000`} />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/85 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none hidden md:block" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        {/* LIVE ACTION DECORATIVE OVERLAYS */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-[10px] font-mono font-black border uppercase tracking-wider rounded ${currentSlide.badgeColor}`}>
              {currentSlide.league}
            </span>
            <div className="flex items-center gap-1.5 text-red-500 font-mono text-[9px] md:text-xs font-black tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              LIVE SIMULATION
            </div>
          </div>

          {/* QUEEN ANTHEM FLOATING MUSIC PLAYER */}
          <button
            onClick={toggleMusic}
            className={`flex items-center gap-2.5 px-3 md:px-3.5 py-1.5 rounded-full border text-[10px] font-bold transition-all backdrop-blur-md cursor-pointer select-none w-fit ${
              isMusicPlaying 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse" 
                : "bg-black/50 text-zinc-400 border-zinc-800 hover:border-zinc-750 hover:text-white"
            }`}
            title="Toggle Theme Song: Queen - We Are The Champions"
          >
            <div className={`relative flex items-center justify-center ${isMusicPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "4s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}>
              <Disc className="w-3.5 h-3.5" />
              {isMusicPlaying && (
                <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-start leading-none text-left font-sans">
              <span className="text-[7.5px] uppercase tracking-widest font-black opacity-60">QUEEN ANTHEM</span>
              <span className="text-[10px] font-black mt-0.5 tracking-wide">
                {isMusicPlaying ? "We Are The Champions 🎵" : "Play Queen Anthem 🎵"}
              </span>
            </div>

            {isMusicPlaying && (
              <div className="flex items-end gap-[1.5px] h-2.5 ml-1">
                <span className="w-[2px] bg-amber-400 animate-[pulse_0.6s_infinite_alternate]" style={{ height: '60%' }} />
                <span className="w-[2px] bg-amber-400 animate-[pulse_0.4s_infinite_alternate]" style={{ height: '100%' }} />
                <span className="w-[2px] bg-amber-400 animate-[pulse_0.8s_infinite_alternate]" style={{ height: '40%' }} />
              </div>
            )}
          </button>
        </div>

        {/* CONTROLS OVERLAY - TOP RIGHT */}
        <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20 flex items-center gap-2">
          {/* MUTE CONTROLLER */}
          <button
            onClick={toggleMute}
            className="p-2 md:p-3 bg-black/50 hover:bg-[#03a9f4]/20 border border-zinc-800 hover:border-[#03a9f4]/30 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* PLAY / PAUSE CONTROLLER */}
          <button
            onClick={togglePlay}
            className="p-2 md:p-3 bg-black/50 hover:bg-[#03a9f4]/20 border border-zinc-800 hover:border-[#03a9f4]/30 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
            title={isPlaying ? "Pause Slideshow" : "Resume Slideshow"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* MAIN CINEMATIC INFORMATION BLOCK */}
        <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-10 md:right-10 z-20 flex flex-col gap-5 pointer-events-auto">
          
          <div className="max-w-xl space-y-1 md:space-y-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#03a9f4]" />
              <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-[#03a9f4] drop-shadow">
                {currentSlide.sport}
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-1 md:space-y-2"
              >
                <h3 className="font-anton text-2xl md:text-4xl text-white uppercase tracking-wider leading-none">
                  {currentSlide.title}
                </h3>
                <p className="text-zinc-300 text-[10px] md:text-sm font-medium leading-relaxed drop-shadow-md">
                  {currentSlide.tagline}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* INTERACTIVE TEAM IMAGES SELECTION DRAWER */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#03a9f4]" />
              Featured {currentSlide.league} Team Collections (Click to Shop)
            </p>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`teams-${currentSlide.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-wrap gap-2 md:gap-3"
                >
                  {currentSlide.featuredTeams.map((team) => (
                    <button
                      key={team.name}
                      onClick={() => onSelectTeam(currentSlide.league, team.name)}
                      className="flex items-center gap-2 bg-black/60 hover:bg-[#03a9f4]/20 border border-zinc-800 hover:border-[#03a9f4]/40 rounded-full px-3 py-1.5 transition-all cursor-pointer group/team"
                    >
                      {/* Team representative image thumbnail */}
                      <div className="relative w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-zinc-700 group-hover/team:border-[#03a9f4] transition-colors">
                        <img
                          src={team.imageUrl}
                          alt={team.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/team:scale-110 transition-transform duration-300"
                        />
                        <div 
                          className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-white border-[0.5px]"
                          style={{ backgroundColor: team.primaryColor }}
                        />
                      </div>
                      
                      <span className="text-[10px] md:text-xs font-bold text-zinc-300 group-hover/team:text-white transition-colors">
                        {team.short}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* MAIN LEAGUE CTA */}
              <button
                onClick={() => onSelectLeague(currentSlide.league)}
                className="ml-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#03a9f4] hover:bg-blue-500 text-black hover:text-white transition-all font-extrabold text-[10px] tracking-widest uppercase rounded-full cursor-pointer shadow-lg shadow-[#03a9f4]/10"
              >
                <ShoppingBag className="w-3 h-3" />
                All {currentSlide.league} Gear
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION PREV / NEXT CHEVRONS */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-[#03a9f4]/30 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-zinc-800/40 hidden md:flex items-center justify-center z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-[#03a9f4]/30 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-zinc-800/40 hidden md:flex items-center justify-center z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* TIMER PROGRESS BAR */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-950/80 z-20">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-[#03a9f4] to-indigo-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* BOTTOM SLIDE GRID SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-6">
        {SPORTS_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(true);
              }}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none relative overflow-hidden group/thumb ${
                isActive
                  ? "bg-zinc-950 border-[#03a9f4] shadow-[0_0_15px_rgba(3,169,244,0.15)]"
                  : "bg-[#03060b]/80 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-950"
              }`}
            >
              {/* Active Glowing Indicator overlay */}
              {isActive && (
                <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-[#03a9f4] to-indigo-500" />
              )}
              
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                  isActive 
                    ? "bg-[#03a9f4]/10 text-[#03a9f4] border border-[#03a9f4]/20" 
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                }`}>
                  {slide.league}
                </span>
                
                {isActive && (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#03a9f4] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#03a9f4]"></span>
                  </span>
                )}
              </div>
              
              <h4 className={`text-[11px] font-black uppercase tracking-wider mt-2 transition-colors ${
                isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
              }`}>
                {slide.title}
              </h4>
              <p className="text-[9px] text-zinc-600 mt-0.5 truncate">
                {slide.sport}
              </p>
            </button>
          );
        })}
      </div>

      {/* FLOATING STADIUM MUSIC HUB AND VOLUME WIDGET */}
      <div className="fixed bottom-24 right-6 z-[2000] flex flex-col items-end gap-3 font-sans select-none">
        <AnimatePresence>
          {isVolumePanelOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] w-72 text-white space-y-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 ${isMusicPlaying ? "" : "hidden"}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isMusicPlaying ? "bg-amber-500" : "bg-zinc-600"}`}></span>
                  </span>
                  <div className="text-left leading-none">
                    <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-wider">STADIUM ANTHEM</h5>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5 truncate max-w-[150px]" title="We Are The Champions">Queen — We Are The Champions</p>
                  </div>
                </div>
                
                {/* Mirror Status Selector */}
                <button
                  onClick={rotateAnthemUrl}
                  className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2 py-1 rounded text-[9px] font-mono font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Switch to alternative Archive.org backup mirror stream"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isAudioLoading ? "animate-spin text-amber-400" : ""}`} />
                  Mirror {musicUrlIndex + 1}
                </button>
              </div>

              {/* Status / Loading details */}
              {audioError ? (
                <div className="flex items-start gap-1.5 text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="leading-tight text-left">{audioError}</span>
                </div>
              ) : isAudioLoading ? (
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 py-1 font-bold">
                  <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Stadium track buffering...
                </div>
              ) : null}

              {/* Play / Pause & Volume Adjusters */}
              <div className="flex items-center justify-between gap-4">
                {/* Play/Pause round indicator */}
                <button
                  onClick={toggleMusic}
                  className={`flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all ${
                    isMusicPlaying 
                      ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20" 
                      : "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-zinc-700"
                  }`}
                  title={isMusicPlaying ? "Pause Track" : "Play Track"}
                >
                  {isMusicPlaying ? (
                    <Pause className="w-4 h-4 text-black fill-black" />
                  ) : (
                    <Play className="w-4 h-4 translate-x-0.5 fill-white" />
                  )}
                </button>

                {/* Styled Volume Control Area */}
                <div className="flex-1 flex flex-col gap-1 text-left">
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                    <span>Volume</span>
                    <span className="text-white font-mono">{isMusicMuted ? "0%" : `${Math.round(musicVolume * 100)}%`}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMusicMuted(!isMusicMuted)}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={isMusicMuted ? "Unmute" : "Mute"}
                    >
                      {isMusicMuted || musicVolume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : musicVolume < 0.4 ? (
                        <Volume1 className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMusicMuted ? 0 : musicVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setMusicVolume(val);
                        if (val > 0) {
                          setIsMusicMuted(false);
                        }
                      }}
                      className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 outline-none range-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>{formatTime(audioCurrentTime)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
                <div 
                  onClick={(e) => {
                    if (!audioRef.current || audioDuration <= 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    audioRef.current.currentTime = percent * audioDuration;
                  }}
                  className="h-1 bg-zinc-900 rounded-full overflow-hidden relative cursor-pointer group/progress"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all ease-out"
                    style={{ width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%` }}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsVolumePanelOpen(!isVolumePanelOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all border shadow-[0_5px_15px_rgba(0,0,0,0.4)] ${
            isMusicPlaying 
              ? "bg-gradient-to-tr from-amber-600 to-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20 animate-pulse" 
              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
          }`}
          title="Adjust Stadium Anthem Volume & Fallback Mirrors"
        >
          {isMusicPlaying ? (
            <div className="relative flex items-center justify-center">
              <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: "3s", animationTimingFunction: "linear", animationIterationCount: "infinite" }} />
              <div className="absolute flex items-end gap-[1px] h-2.5 -bottom-0.5">
                <span className="w-[1.5px] bg-black animate-[pulse_0.4s_infinite_alternate]" style={{ height: '70%' }} />
                <span className="w-[1.5px] bg-black animate-[pulse_0.3s_infinite_alternate]" style={{ height: '100%' }} />
                <span className="w-[1.5px] bg-black animate-[pulse_0.5s_infinite_alternate]" style={{ height: '50%' }} />
              </div>
            </div>
          ) : (
            <Sliders className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* BACKGROUND ANTHEM AUDIO ENGINE WITH BUILT-IN FAILSAFE LOGIC */}
      <audio
        ref={audioRef}
        src={QUEEN_ANTHEM_URLS[musicUrlIndex]}
        loop
        preload="auto"
        onLoadStart={() => setIsAudioLoading(true)}
        onCanPlay={() => {
          setIsAudioLoading(false);
          if (audioError && !audioError.includes("Autoplay")) {
            setAudioError(null);
          }
        }}
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setAudioCurrentTime(audioRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration || 0);
          }
        }}
        onError={() => {
          console.error("Audio stream loading error on mirror index " + musicUrlIndex);
          const nextIndex = (musicUrlIndex + 1) % QUEEN_ANTHEM_URLS.length;
          if (nextIndex === 0) {
            setIsAudioLoading(false);
            setIsMusicPlaying(false);
            setAudioError("Audio stream restricted by browser CORS sandbox. Try opening app in new tab.");
            return;
          }
          setMusicUrlIndex(nextIndex);
          setAudioError(`Mirror ${musicUrlIndex + 1} sluggish. Trying Mirror ${nextIndex + 1}...`);
          setIsAudioLoading(true);
          
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.load();
              if (isMusicPlaying) {
                audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
                audioRef.current.muted = isMusicMuted;
                audioRef.current.play()
                  .then(() => {
                    setIsMusicPlaying(true);
                    setAudioError(null);
                  })
                  .catch(() => {});
              }
            }
          }, 400);
        }}
      />
    </div>
  );
}
