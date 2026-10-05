import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Flame, 
  Play, 
  Share2, 
  ThumbsUp, 
  Sparkles, 
  Tv, 
  ChevronRight, 
  Plus, 
  X, 
  Check, 
  Star,
  Users,
  Target,
  Clock,
  Volume2,
  VolumeX,
  Smartphone
} from "lucide-react";
import { FandomJourney } from "./FandomJourney";
import { isFirebaseConfigured, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, getDoc, getDocs } from "firebase/firestore";

interface FanStandProps {
  onShowToast: (msg: string) => void;
  onOpenChat: () => void;
  onScrollToCatalog: () => void;
  onAboutOpen?: () => void;
  onClose?: () => void;
}

interface Game {
  id: string;
  league: string;
  time: string;
  teamHome: string;
  teamAway: string;
  scoreHome: number;
  scoreAway: number;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  featured?: boolean;
}

interface FanPost {
  id: string;
  username: string;
  likes: number;
  image: string;
  caption: string;
  likedByUser?: boolean;
}

const getRelativeDateString = (daysOffset: number, hourStr: string) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  if (daysOffset === 0) {
    return `TODAY, ${hourStr}`;
  } else if (daysOffset === 1) {
    return `TOMORROW, ${hourStr}`;
  } else if (daysOffset === -1) {
    return `YESTERDAY, ${hourStr}`;
  } else {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${hourStr}`;
  }
};

const getDynamicInitialGames = (): Record<string, Game[]> => {
  return {
    NFL: [
      { id: "nfl-1", league: "NFL", time: getRelativeDateString(0, "8:20 PM"), teamHome: "Seattle Seahawks", teamAway: "New England Patriots", scoreHome: 14, scoreAway: 10, status: "LIVE", featured: true },
      { id: "nfl-2", league: "NFL", time: getRelativeDateString(0, "4:25 PM"), teamHome: "SF 49ers", teamAway: "LA Rams", scoreHome: 28, scoreAway: 21, status: "FINISHED" },
      { id: "nfl-3", league: "NFL", time: getRelativeDateString(1, "1:00 PM"), teamHome: "Buccaneers", teamAway: "Bengals", scoreHome: 0, scoreAway: 0, status: "SCHEDULED" },
      { id: "nfl-4", league: "NFL", time: getRelativeDateString(1, "4:00 PM"), teamHome: "Saints", teamAway: "Lions", scoreHome: 0, scoreAway: 0, status: "SCHEDULED" },
      { id: "nfl-5", league: "NFL", time: getRelativeDateString(1, "8:15 PM"), teamHome: "Kansas City Chiefs", teamAway: "Las Vegas Raiders", scoreHome: 0, scoreAway: 0, status: "SCHEDULED" }
    ],
    NBA: [
      { id: "nba-1", league: "NBA", time: getRelativeDateString(-1, "7:30 PM"), teamHome: "Boston Celtics", teamAway: "New York Knicks", scoreHome: 114, scoreAway: 109, status: "FINISHED", featured: true },
      { id: "nba-2", league: "NBA", time: getRelativeDateString(0, "7:00 PM"), teamHome: "Golden State Warriors", teamAway: "Phoenix Suns", scoreHome: 94, scoreAway: 98, status: "LIVE" },
      { id: "nba-3", league: "NBA", time: getRelativeDateString(1, "8:00 PM"), teamHome: "Milwaukee Bucks", teamAway: "Brooklyn Nets", scoreHome: 0, scoreAway: 0, status: "SCHEDULED" }
    ],
    WNBA: [
      { id: "wnba-1", league: "WNBA", time: getRelativeDateString(0, "7:00 PM"), teamHome: "New York Liberty", teamAway: "Las Vegas Aces", scoreHome: 82, scoreAway: 79, status: "LIVE", featured: true },
      { id: "wnba-2", league: "WNBA", time: getRelativeDateString(1, "7:30 PM"), teamHome: "Seattle Storm", teamAway: "Indiana Fever", scoreHome: 0, scoreAway: 0, status: "SCHEDULED" }
    ],
    MLB: [
      { id: "mlb-1", league: "MLB", time: getRelativeDateString(-1, "1:05 PM"), teamHome: "New York Yankees", teamAway: "Boston Red Sox", scoreHome: 5, scoreAway: 2, status: "FINISHED" },
      { id: "mlb-2", league: "MLB", time: getRelativeDateString(0, "7:10 PM"), teamHome: "Los Angeles Dodgers", teamAway: "San Francisco Giants", scoreHome: 3, scoreAway: 2, status: "LIVE", featured: true }
    ],
    NHL: [
      { id: "nhl-1", league: "NHL", time: getRelativeDateString(0, "7:00 PM"), teamHome: "Boston Bruins", teamAway: "Montreal Canadiens", scoreHome: 2, scoreAway: 1, status: "LIVE", featured: true },
      { id: "nhl-2", league: "NHL", time: getRelativeDateString(1, "8:00 PM"), teamHome: "Chicago Blackhawks", teamAway: "Detroit Red Wings", scoreHome: 0, scoreAway: 0, status: "SCHEDULED" }
    ],
    MLS: [
      { id: "mls-1", league: "MLS", time: getRelativeDateString(0, "7:30 PM"), teamHome: "Inter Miami", teamAway: "LA Galaxy", scoreHome: 1, scoreAway: 2, status: "LIVE", featured: true }
    ]
  };
};

const INITIAL_GAMES = getDynamicInitialGames();

const SHOWN_TEAM_IMAGES = [
  "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=60"
];

export function FanStand({ onShowToast, onOpenChat, onScrollToCatalog, onAboutOpen, onClose }: FanStandProps) {
  const [activeLeague, setActiveLeague] = useState<string>("NFL");
  const [games, setGames] = useState<Record<string, Game[]>>(INITIAL_GAMES);
  const [selectedGame, setSelectedGame] = useState<Game>(INITIAL_GAMES.NFL[0]);
  
  // User Profile
  const [fanId, setFanId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userPoints, setUserPoints] = useState<number>(1200);

  // Predict Matchup state (keyed by game ID)
  const [predictions, setPredictions] = useState<Record<string, string>>({});

  // Ratings state
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [globalRatings, setGlobalRatings] = useState<Record<string, { starsSum: number, ratingsCount: number }>>({});

  // Leaderboard entries
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Trophy Stats tabs
  const [trophyTab, setTrophyTab] = useState<"GLOBAL" | "REGION" | "STATE" | "CITY">("GLOBAL");

  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Fan Showcase State
  const [showcasePosts, setShowcasePosts] = useState<FanPost[]>([]);
  const [newPostModal, setNewPostModal] = useState<boolean>(false);
  const [newPostCaption, setNewPostCaption] = useState<string>("");
  const [newPostUsername, setNewPostUsername] = useState<string>("");
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(SHOWN_TEAM_IMAGES[2]);

  // 1. Initialize User Profile
  useEffect(() => {
    let storedId = localStorage.getItem("fancor_fan_id");
    let storedName = localStorage.getItem("fancor_fan_username");
    let storedPoints = localStorage.getItem("fancor_fan_points");
    const storedPredictions = localStorage.getItem("fancor_fan_predictions");

    if (!storedId) {
      storedId = "fan_" + Math.random().toString(36).substring(2, 8);
      localStorage.setItem("fancor_fan_id", storedId);
    }
    if (!storedName) {
      storedName = "Fan_" + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem("fancor_fan_username", storedName);
    }
    if (!storedPoints) {
      storedPoints = "1200";
      localStorage.setItem("fancor_fan_points", storedPoints);
    }
    if (storedPredictions) {
      try {
        setPredictions(JSON.parse(storedPredictions));
      } catch (e) {}
    }

    setFanId(storedId);
    setUsername(storedName);
    setUserPoints(parseInt(storedPoints, 10));
  }, []);

  // 2. Sync user points to Firestore & LocalStorage
  useEffect(() => {
    if (!fanId || !username) return;

    localStorage.setItem("fancor_fan_points", String(userPoints));

    if (isFirebaseConfigured && db) {
      const syncLeaderboard = async () => {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "fan_leaderboard", fanId), {
          fanId,
          username,
          points: userPoints,
          updatedAt: new Date().toISOString()
        });
      };
      syncLeaderboard().catch(console.error);
    }
  }, [userPoints, fanId, username]);

  // 3. Subscribe to Leaderboard
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const unsub = onSnapshot(collection(db, "fan_leaderboard"), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => d.data());
          list.sort((a, b) => (b.points || 0) - (a.points || 0));
          setLeaderboard(list);
        } else {
          setLeaderboard([
            { fanId: "default_1", username: "Fan #8bBLK6", points: 1000 },
            { fanId: "default_2", username: "GridironKing", points: 850 },
            { fanId: "default_3", username: "EaglesFanatics", points: 720 },
          ]);
        }
      }, (err) => {
        console.error("Error subscribing to fan_leaderboard:", err);
      });
      return () => unsub();
    } else {
      setLeaderboard([
        { fanId: "default_1", username: "Fan #8bBLK6", points: 1000 },
        { fanId: "default_2", username: "GridironKing", points: 850 },
        { fanId: "default_3", username: "EaglesFanatics", points: 720 },
      ]);
    }
  }, []);

  // 4. Subscribe to Fan Showcase Posts
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const unsub = onSnapshot(collection(db, "fan_posts"), (snapshot) => {
        if (snapshot.empty) {
          const initialPosts: FanPost[] = [
            {
              id: "post-1",
              username: "GridironKing",
              likes: 98500,
              image: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=60",
              caption: "Misty stadium runs before Sunday game day! Rep'ing the official FanCor training hoody."
            },
            {
              id: "post-2",
              username: "EaglesFanatics",
              likes: 45200,
              image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=60",
              caption: "Road trip tailgating in the blue camper! Loving the custom league accessory kit!"
            }
          ];

          const seedPosts = async () => {
            const { doc, setDoc } = await import("firebase/firestore");
            for (const post of initialPosts) {
              await setDoc(doc(db, "fan_posts", post.id), {
                ...post,
                createdAt: new Date().toISOString()
              });
            }
          };
          seedPosts().catch(console.error);
        } else {
          const postsList = snapshot.docs.map(d => d.data() as FanPost);
          postsList.sort((a, b) => {
            const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
            const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
            return bTime - aTime;
          });

          const likedPostIds = JSON.parse(localStorage.getItem("fancor_liked_posts") || "[]");
          const updatedPosts = postsList.map(p => ({
            ...p,
            likedByUser: likedPostIds.includes(p.id)
          }));

          setShowcasePosts(updatedPosts);
        }
      }, (err) => {
        console.error("Error subscribing to fan_posts:", err);
      });

      return () => unsub();
    } else {
      setShowcasePosts([
        {
          id: "post-1",
          username: "GridironKing",
          likes: 98500,
          image: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=60",
          caption: "Misty stadium runs before Sunday game day! Rep'ing the official FanCor training hoody."
        },
        {
          id: "post-2",
          username: "EaglesFanatics",
          likes: 45200,
          image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=60",
          caption: "Road trip tailgating in the blue camper! Loving the custom league accessory kit!"
        }
      ]);
    }
  }, []);

  // 5. Subscribe to Fanstand Games (Real-Time Scoreboard)
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const unsub = onSnapshot(collection(db, "fanstand_games"), (snapshot) => {
        if (snapshot.empty) {
          const initial = getDynamicInitialGames();
          const batchList = [...initial.NFL, ...initial.NBA, ...initial.WNBA, ...initial.MLB, ...initial.NHL, ...initial.MLS];
          
          const seedGames = async () => {
            const { writeBatch, doc } = await import("firebase/firestore");
            const b = writeBatch(db);
            batchList.forEach((game) => {
              b.set(doc(db, "fanstand_games", game.id), {
                ...game,
                updatedAt: new Date().toISOString()
              });
            });
            await b.commit();
          };
          seedGames().catch(console.error);
        } else {
          const gamesList = snapshot.docs.map(d => d.data() as Game);
          
          // Check age
          const firstGame = gamesList[0];
          let isTooOld = false;
          if (firstGame && (firstGame as any).updatedAt) {
            const updatedTime = new Date((firstGame as any).updatedAt).getTime();
            const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
            if (updatedTime < twoDaysAgo) {
              isTooOld = true;
            }
          }

          if (isTooOld) {
            const initial = getDynamicInitialGames();
            const batchList = [...initial.NFL, ...initial.NBA, ...initial.WNBA, ...initial.MLB, ...initial.NHL, ...initial.MLS];
            
            const reseedGames = async () => {
              const { writeBatch, doc } = await import("firebase/firestore");
              const b = writeBatch(db);
              batchList.forEach((game) => {
                b.set(doc(db, "fanstand_games", game.id), {
                  ...game,
                  updatedAt: new Date().toISOString()
                });
              });
              await b.commit();
            };
            reseedGames().catch(console.error);
          } else {
            const mapped: Record<string, Game[]> = {
              NFL: [], NBA: [], WNBA: [], MLB: [], NHL: [], MLS: []
            };
            gamesList.forEach((game) => {
              if (mapped[game.league]) {
                mapped[game.league].push(game);
              }
            });
            
            Object.keys(mapped).forEach((lg) => {
              mapped[lg].sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id.localeCompare(b.id);
              });
            });
            
            setGames(mapped);

            setSelectedGame((prev) => {
              const found = gamesList.find(g => g.id === prev.id);
              return found ? found : prev;
            });
          }
        }
      }, (err) => {
        console.error("Error subscribing to fanstand_games:", err);
      });

      return () => unsub();
    }
  }, []);

  // 6. Subscribe to global ratings
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const unsub = onSnapshot(collection(db, "fan_ratings"), (snapshot) => {
        const mapped: Record<string, { starsSum: number, ratingsCount: number }> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          mapped[doc.id] = {
            starsSum: data.starsSum || 0,
            ratingsCount: data.ratingsCount || 0
          };
        });
        setGlobalRatings(mapped);
      });
      return () => unsub();
    }
  }, []);

  // 7. Simulating scores periodically (collaboration across clients)
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.15) return; // 15% chance to perform update per tick

      const allGames = Object.values(games).flat() as Game[];
      const liveGames = allGames.filter(g => g.status === "LIVE");
      if (liveGames.length === 0) return;

      const randomGame = liveGames[Math.floor(Math.random() * liveGames.length)];
      
      let homeIncrement = 0;
      let awayIncrement = 0;
      const roll = Math.random();
      
      const getLeagueIncrement = (league: string): number => {
        const iRoll = Math.random();
        if (iRoll > 0.7) return 0;
        switch (league) {
          case "NFL":
            const nflRoll = Math.random();
            if (nflRoll < 0.6) return 3;
            if (nflRoll < 0.9) return 7;
            return 2;
          case "NBA":
          case "WNBA":
            const nbaRoll = Math.random();
            if (nbaRoll < 0.15) return 1;
            if (nbaRoll < 0.75) return 2;
            return 3;
          case "MLB":
          case "NHL":
          case "MLS":
            return 1;
          default:
            return 0;
        }
      };

      if (roll < 0.5) {
        homeIncrement = getLeagueIncrement(randomGame.league);
      } else {
        awayIncrement = getLeagueIncrement(randomGame.league);
      }

      if (homeIncrement === 0 && awayIncrement === 0) return;

      const newScoreHome = randomGame.scoreHome + homeIncrement;
      const newScoreAway = randomGame.scoreAway + awayIncrement;

      const gameRef = doc(db, "fanstand_games", randomGame.id);
      updateDoc(gameRef, {
        scoreHome: newScoreHome,
        scoreAway: newScoreAway,
        updatedAt: new Date().toISOString()
      }).catch((err) => console.error("Error updating live score in Firestore:", err));

    }, 12000);

    return () => clearInterval(interval);
  }, [games]);

  // Handlers
  const handleLeagueChange = (league: string) => {
    setActiveLeague(league);
    const leagueGames = games[league];
    if (leagueGames && leagueGames.length > 0) {
      const featured = leagueGames.find(g => g.featured) || leagueGames[0];
      setSelectedGame(featured);
    }
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
  };

  const handlePredict = (teamName: string) => {
    const gameId = selectedGame.id;
    if (predictions[gameId]) {
      onShowToast("You already placed your prediction for this match!");
      return;
    }

    const updatedPredictions = {
      ...predictions,
      [gameId]: teamName
    };

    setPredictions(updatedPredictions);
    localStorage.setItem("fancor_fan_predictions", JSON.stringify(updatedPredictions));

    setUserPoints(prev => prev + 150);
    onShowToast(`Prediction placed on ${teamName}! +150 Points earned!`);
  };

  const handleRateTeam = async (team: string, rating: number) => {
    setRatings(prev => ({ ...prev, [team]: rating }));

    if (isFirebaseConfigured && db) {
      try {
        const { doc, getDoc, setDoc } = await import("firebase/firestore");
        const docRef = doc(db, "fan_ratings", team);
        const docSnap = await getDoc(docRef);
        
        let starsSum = rating;
        let ratingsCount = 1;
        
        if (docSnap.exists()) {
          starsSum = (docSnap.data().starsSum || 0) + rating;
          ratingsCount = (docSnap.data().ratingsCount || 0) + 1;
        }

        await setDoc(docRef, {
          teamName: team,
          starsSum,
          ratingsCount
        });

        setUserPoints(prev => prev + 50);
        onShowToast(`Rated ${team} as ${rating} Stars! +50 Points earned!`);
      } catch (error) {
        console.error("Error rating team:", error);
        handleFirestoreError(error, OperationType.WRITE, "fan_ratings");
      }
    } else {
      setUserPoints(prev => prev + 50);
      onShowToast(`Rated ${team} as ${rating} Stars! +50 Points earned!`);
    }
  };

  const handleLikePost = async (postId: string) => {
    const likedPostIds = JSON.parse(localStorage.getItem("fancor_liked_posts") || "[]");
    const isAlreadyLiked = likedPostIds.includes(postId);

    let nextLikedPostIds: string[];
    if (isAlreadyLiked) {
      nextLikedPostIds = likedPostIds.filter((id: string) => id !== postId);
    } else {
      nextLikedPostIds = [...likedPostIds, postId];
    }
    localStorage.setItem("fancor_liked_posts", JSON.stringify(nextLikedPostIds));

    if (isFirebaseConfigured && db) {
      try {
        const { doc, getDoc, updateDoc } = await import("firebase/firestore");
        const postRef = doc(db, "fan_posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const currentLikes = postSnap.data().likes || 0;
          const nextLikes = isAlreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
          await updateDoc(postRef, { likes: nextLikes });
          
          if (!isAlreadyLiked && nextLikes === 100000 && postSnap.data().username === "GridironKing") {
            onShowToast("🏆 GridironKing unlocked the 100K Challenge! VIP rewards released to contributors!");
          }
        }
      } catch (error) {
        console.error("Error liking post in Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, "fan_posts");
      }
    } else {
      setShowcasePosts(prev => 
        prev.map(p => {
          if (p.id === postId) {
            const isLiked = p.likedByUser;
            const nextLikes = isLiked ? p.likes - 1 : p.likes + 1;
            return {
              ...p,
              likes: nextLikes,
              likedByUser: !isLiked
            };
          }
          return p;
        })
      );
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostUsername.trim() || !newPostCaption.trim()) {
      onShowToast("Please enter both a fan name and description!");
      return;
    }

    const postId = `post-${Date.now()}`;
    const post: FanPost = {
      id: postId,
      username: newPostUsername.trim(),
      likes: 1,
      image: selectedPresetImage,
      caption: newPostCaption.trim(),
      likedByUser: true
    };

    const likedPostIds = JSON.parse(localStorage.getItem("fancor_liked_posts") || "[]");
    localStorage.setItem("fancor_liked_posts", JSON.stringify([...likedPostIds, postId]));

    if (isFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "fan_posts", postId), {
          ...post,
          createdAt: new Date().toISOString()
        });
        onShowToast("🏆 Your Fan Showcase photo was posted successfully! Fandom active.");
      } catch (error) {
        console.error("Error saving post to Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, "fan_posts");
      }
    } else {
      setShowcasePosts(prev => [post, ...prev]);
      onShowToast("🏆 Your Fan Showcase photo was posted successfully! Fandom active.");
    }

    setNewPostModal(false);
    setNewPostUsername("");
    setNewPostCaption("");
  };

  // Helper getters
  const getAverageStars = (team: string): number => {
    const global = globalRatings[team];
    if (global && global.ratingsCount > 0) {
      return Math.round(global.starsSum / global.ratingsCount);
    }
    return ratings[team] || 0;
  };

  const getRatingsCountStr = (team: string): string => {
    const global = globalRatings[team];
    if (global && global.ratingsCount > 0) {
      return `${global.ratingsCount} review${global.ratingsCount > 1 ? 's' : ''}`;
    }
    return ratings[team] ? "1 review" : "No ratings yet";
  };

  const predictedTeam = predictions[selectedGame.id] || null;
  const hasPredicted = !!predictions[selectedGame.id];

  return (
    <section id="fan-stand" className="bg-[#050505] text-white py-16 px-4 md:px-12 relative overflow-hidden border-t border-zinc-900 scroll-mt-24">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#03a9f4]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. SECTION HEADER */}
      <div className="max-w-[1400px] mx-auto text-center mb-12 space-y-4">
        <h2 className="font-anton text-5xl sm:text-7xl md:text-8xl tracking-[0.05em] uppercase text-[#03a9f4] drop-shadow-[0_0_25px_rgba(3,169,244,0.15)] leading-none">
          THE FAN STAND
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-extrabold tracking-widest text-zinc-300 uppercase">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            WATCH
          </span>
          <span>•</span>
          <span>RATE</span>
          <span>•</span>
          <span>PREDICT</span>
          <span>•</span>
          <span>EARN</span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onShowToast("Successfully joined your premium FanCor Fandom! Access unlocked.")}
            className="bg-[#e61c34] hover:bg-red-500 text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest transition-all cursor-pointer shadow-lg shadow-red-600/20"
          >
            Join Your Fandom
          </motion.button>
          {onClose && (
            <>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-zinc-800 hover:bg-zinc-750 text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest transition-all cursor-pointer shadow-md"
              >
                Close Fan Stand
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC HUB LAYOUT GRID */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        
        {/* LEFT COLUMN (lg:8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. LIVE HIGHLIGHT REEL CARD */}
          <div className="bg-[#0f0f11]/90 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative group">
            {/* Aspect frame wrapper */}
            <div className="aspect-[16/9] w-full relative bg-zinc-950 flex items-center justify-center overflow-hidden">
              {isVideoPlaying ? (
                // Playing Simulated Video Screen
                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-zinc-900">
                  {/* Video Top Controls */}
                  <div className="flex justify-between items-center z-10">
                    <span className="bg-red-600 px-2.5 py-1 rounded text-[10px] font-black tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE HIGHLIGHT STREAM
                    </span>
                    <button 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Simulated Visual Waveform representing dynamic sound/video */}
                  <div className="flex items-center justify-center gap-1 h-32">
                    {[...Array(32)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [12, Math.random() * 80 + 15, 12] }}
                        transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity }}
                        className="w-1 bg-[#03a9f4] rounded-full"
                      />
                    ))}
                  </div>

                  {/* Video Bottom overlay */}
                  <div className="bg-gradient-to-t from-black/80 to-transparent p-4 -mx-4 -mb-4 space-y-1">
                    <p className="text-sm font-bold text-[#03a9f4]">
                      Now Streaming: {selectedGame.teamAway} at {selectedGame.teamHome}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>00:45 / 03:00</span>
                      <button 
                        onClick={() => setIsVideoPlaying(false)}
                        className="text-[#e61c34] font-bold hover:underline uppercase"
                      >
                        Stop Playback
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Video Poster State
                <>
                  <img 
                    src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80" 
                    alt="Stadium Highlights" 
                    className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Giant Central Play Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsVideoPlaying(true);
                      onShowToast("Playing Match Highlight Reel...");
                    }}
                    className="w-20 h-20 bg-[#03a9f4]/90 hover:bg-[#03a9f4] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#03a9f4]/30 hover:shadow-[#03a9f4]/50 transition-all cursor-pointer z-10 group"
                  >
                    <Play className="w-8 h-8 fill-white ml-1.5 text-white" />
                  </motion.button>

                  <div className="absolute top-5 left-5">
                    <span className="bg-zinc-950/80 border border-zinc-800 px-3 py-1 rounded text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
                      MATCH CLIP PORTAL
                    </span>
                  </div>

                  {/* Bottom Text Overlays */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-500 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-md mb-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        LIVE HIGHLIGHT REEL
                      </span>
                      <h3 className="font-anton text-2xl uppercase text-white tracking-wider">
                        {selectedGame.teamAway} at {selectedGame.teamHome}
                      </h3>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* B. AUTOMATED MATCHUP PREDICTION CARD */}
          <div className="bg-[#0f0f11] border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-anton text-lg uppercase tracking-wider text-zinc-100">
                    AUTOMATED MATCHUP PREDICTION
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                    LOCK YOUR COMP-CAST PREDICTION
                  </p>
                </div>
              </div>

              {/* Wallet Pts Display */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Wallet:</span>
                <span className="font-anton text-[#03a9f4] text-sm tracking-wider">{userPoints.toLocaleString()} PTS</span>
              </div>
            </div>

            {/* Matchup Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Team */}
              <div 
                onClick={() => handlePredict(selectedGame.teamHome)}
                className={`border p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  predictedTeam === selectedGame.teamHome
                    ? "bg-[#03a9f4]/15 border-[#03a9f4] shadow-md shadow-[#03a9f4]/10"
                    : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-zinc-500 uppercase font-mono tracking-widest">HOST TEAM</span>
                  {predictedTeam === selectedGame.teamHome && (
                    <span className="bg-[#03a9f4]/20 border border-[#03a9f4]/30 text-[#03a9f4] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      SELECTED
                    </span>
                  )}
                </div>
                <h4 className="font-anton text-2xl uppercase tracking-wider text-white">
                  {selectedGame.teamHome}
                </h4>
                <div className="flex gap-4 mt-4 text-xs font-mono">
                  <div className="bg-zinc-900/60 rounded px-2.5 py-1 text-zinc-400 border border-zinc-800">
                    Score: <span className="font-bold text-white">{selectedGame.scoreHome}</span>
                  </div>
                  <div className="bg-zinc-900/60 rounded px-2.5 py-1 text-[#03a9f4] border border-zinc-800">
                    Odds: <span className="font-bold">SEA -3.5</span>
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div 
                onClick={() => handlePredict(selectedGame.teamAway)}
                className={`border p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  predictedTeam === selectedGame.teamAway
                    ? "bg-[#03a9f4]/15 border-[#03a9f4] shadow-md shadow-[#03a9f4]/10"
                    : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-zinc-500 uppercase font-mono tracking-widest">VISITOR</span>
                  {predictedTeam === selectedGame.teamAway && (
                    <span className="bg-[#03a9f4]/20 border border-[#03a9f4]/30 text-[#03a9f4] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      SELECTED
                    </span>
                  )}
                </div>
                <h4 className="font-anton text-2xl uppercase tracking-wider text-white">
                  {selectedGame.teamAway}
                </h4>
                <div className="flex gap-4 mt-4 text-xs font-mono">
                  <div className="bg-zinc-900/60 rounded px-2.5 py-1 text-zinc-400 border border-zinc-800">
                    Score: <span className="font-bold text-white">{selectedGame.scoreAway}</span>
                  </div>
                  <div className="bg-zinc-900/60 rounded px-2.5 py-1 text-[#03a9f4] border border-zinc-800">
                    Odds: <span className="font-bold">Follow</span>
                  </div>
                </div>
              </div>
            </div>

            {hasPredicted && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-xs text-center font-bold uppercase tracking-widest"
              >
                🎉 PREDICTION COMMITTED! You'll receive payout point dividends immediately after match finalization.
              </motion.div>
            )}
          </div>

          {/* C. FAN SHOWCASE / THE 100K CHALLENGE CARD */}
          <div className="bg-[#0f0f11] border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#03a9f4]/10 text-[#03a9f4] border border-[#03a9f4]/20 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-anton text-lg uppercase tracking-wider text-zinc-100">
                    FAN SHOWCASE
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                    FANS WEARING OFFICIAL GEAR
                  </p>
                </div>
              </div>

              {/* Post Gear Button */}
              <button 
                onClick={() => setNewPostModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Post Your Gear
              </button>
            </div>

            {/* 100K challenge announcement */}
            <div className="bg-gradient-to-r from-indigo-950/40 via-[#03a9f4]/5 to-zinc-950 border border-[#03a9f4]/15 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5">
              <div className="w-12 h-12 bg-[#03a9f4]/10 text-[#03a9f4] rounded-full flex items-center justify-center shrink-0 border border-[#03a9f4]/20">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-anton text-base uppercase text-[#03a9f4] tracking-wider">
                  THE 100K CHALLENGE
                </h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Post a picture rocking your FanCor gear. If your post reaches <strong className="text-white font-bold">100,000 Likes</strong>, you unlock an exclusive VIP Reward pack!
                </p>
              </div>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showcasePosts.map((post) => {
                const percent = Math.min(Math.round((post.likes / 100000) * 100), 100);
                const isGoalReached = post.likes >= 100000;

                return (
                  <div key={post.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col group">
                    <div className="aspect-[4/3] relative bg-zinc-900">
                      <img 
                        src={post.image} 
                        alt="Fan Gear" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-[#03a9f4]">
                        @{post.username}
                      </div>
                    </div>

                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <p className="text-xs text-zinc-300 font-light leading-relaxed">
                          {post.caption}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-zinc-900">
                        {/* Likes gauge */}
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-[#03a9f4] font-bold">
                            {post.likes.toLocaleString()} LIKES
                          </span>
                          <span className="text-zinc-500">
                            {percent}% TO GOAL
                          </span>
                        </div>
                        
                        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                          <div 
                            style={{ width: `${percent}%` }} 
                            className={`h-full transition-all duration-500 ${isGoalReached ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-pink-500 to-[#03a9f4]'}`}
                          />
                        </div>

                        {/* Interactive Like button */}
                        <div className="flex justify-between items-center pt-1">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                              post.likedByUser 
                                ? "bg-[#03a9f4]/15 text-[#03a9f4]" 
                                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${post.likedByUser ? "fill-current" : ""}`} />
                            {post.likedByUser ? "Liked" : "Like"}
                          </button>

                          {isGoalReached && (
                            <span className="text-emerald-400 text-[10px] font-mono font-black tracking-widest uppercase flex items-center gap-1">
                              <Check className="w-3 h-3" /> GOAL REACHED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (lg:4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* D. GLOBAL SCOREBOARD */}
          <div className="bg-[#0f0f11] border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="font-anton text-lg uppercase tracking-wider text-white">
              GLOBAL SCOREBOARD
            </h3>

            {/* League small pills selectors */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-900">
              {Object.keys(games).map((lg) => (
                <button
                  key={lg}
                  onClick={() => handleLeagueChange(lg)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeLeague === lg
                      ? "bg-[#03a9f4] text-white font-black shadow-md shadow-[#03a9f4]/10"
                      : "bg-zinc-950 text-zinc-500 hover:text-white hover:bg-zinc-900 border border-zinc-900"
                  }`}
                >
                  {lg}
                </button>
              ))}
            </div>

            {/* Games List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {games[activeLeague]?.map((g) => {
                const isSelected = selectedGame.id === g.id;
                
                return (
                  <div 
                    key={g.id}
                    onClick={() => handleSelectGame(g)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected 
                        ? "bg-[#03a9f4]/5 border-[#03a9f4] shadow-md shadow-[#03a9f4]/5" 
                        : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mb-2">
                      <span>{g.time}</span>
                      {g.status === "LIVE" ? (
                        <span className="text-red-500 font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          LIVE
                        </span>
                      ) : g.status === "FINISHED" ? (
                        <span className="text-zinc-600 font-bold uppercase">FINAL</span>
                      ) : (
                        <span className="text-blue-400 font-bold uppercase">SCHEDULED</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${g.status === "FINISHED" && g.scoreAway < g.scoreHome ? "text-zinc-500" : "text-white font-extrabold"}`}>
                          {g.teamAway}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-300">
                          {g.status !== "SCHEDULED" ? g.scoreAway : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${g.status === "FINISHED" && g.scoreHome < g.scoreAway ? "text-zinc-500" : "text-white font-extrabold"}`}>
                          {g.teamHome}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-300">
                          {g.status !== "SCHEDULED" ? g.scoreHome : "-"}
                        </span>
                      </div>
                    </div>

                    {g.featured && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-900/40 flex justify-between items-center">
                        <span className="bg-[#03a9f4]/15 text-[#03a9f4] text-[8px] font-mono font-black tracking-widest px-2 py-0.5 rounded uppercase">
                          FEATURED MATCH
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* E. TEAM MILESTONES PROGRESS TRACKERS */}
          <div className="bg-[#0f0f11] border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="space-y-1 border-b border-zinc-900 pb-3">
              <h3 className="font-anton text-lg uppercase tracking-wider text-white">
                TEAM MILESTONES
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                100 PURCHASES/MO = FREE TEE
              </p>
            </div>

            <div className="space-y-4">
              {/* KC Chiefs */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold uppercase">
                  <span>KANSAS CITY CHIEFS</span>
                  <span className="text-zinc-400">87 <span className="text-[10px] font-mono text-zinc-600">/ 100</span></span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                  <div className="bg-[#03a9f4] h-full rounded-full transition-all duration-500" style={{ width: "87%" }} />
                </div>
              </div>

              {/* SF 49ERS */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold uppercase">
                  <span>SF 49ERS</span>
                  <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3 h-3" /> UNLOCKED
                  </span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Dallas Cowboys */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold uppercase">
                  <span>DALLAS COWBOYS</span>
                  <span className="text-zinc-400">42 <span className="text-[10px] font-mono text-zinc-600">/ 100</span></span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                  <div className="bg-[#03a9f4] h-full rounded-full transition-all duration-500" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* F. RATE THE TEAMS */}
          <div className="bg-[#0f0f11] border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="space-y-1 border-b border-zinc-900 pb-3">
              <h3 className="font-anton text-lg uppercase tracking-wider text-white">
                RATE THE TEAMS
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                SUBMIT YOUR TEAM POWER RATINGS
              </p>
            </div>

            <div className="space-y-4">
              {/* Home Team */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-300 uppercase">{selectedGame.teamHome}</span>
                  <span className="text-[10px] font-mono text-zinc-500">Power Rating</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateTeam(selectedGame.teamHome, star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= (ratings[selectedGame.teamHome] || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-700 hover:text-yellow-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Away Team */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-300 uppercase">{selectedGame.teamAway}</span>
                  <span className="text-[10px] font-mono text-zinc-500">Power Rating</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateTeam(selectedGame.teamAway, star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= (ratings[selectedGame.teamAway] || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-700 hover:text-yellow-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* G. TROPHY STATS */}
          <div className="bg-[#0f0f11] border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-anton text-lg uppercase tracking-wider text-white">
                TROPHY STATS
              </h3>
            </div>

            {/* Sub tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-900">
              {(["GLOBAL", "REGION", "STATE", "CITY"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTrophyTab(tab)}
                  className={`py-1 rounded text-[8px] font-black uppercase tracking-wider text-center transition-all ${
                    trophyTab === tab
                      ? "bg-yellow-400 text-black font-black"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                PROFILE CAST - TOP 5 {trophyTab} FANS. REACH YOUR MARK TO UNLOCK VIP COMPENSATION!
              </div>

              {/* Leaderboard Item */}
              <div className="bg-zinc-950/70 border border-zinc-900 rounded-xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-400/10 border border-yellow-400/25 rounded-md flex items-center justify-center text-yellow-400 font-anton text-xs">
                    #1
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-white">Fan #8bBLK6</span>
                    <span className="text-[9px] font-mono text-zinc-500 block">FREE AGENT</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-anton text-zinc-300 block">1,000 pts</span>
                  <span className="bg-green-500/15 text-green-400 text-[8px] font-mono font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                    REWARD: 100,000
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. FEATURED MATCHUP APPAREL BANNER */}
      <div className="max-w-[1400px] mx-auto bg-gradient-to-r from-[#0a1523] via-[#040910] to-[#020408] border border-zinc-900 rounded-3xl p-8 text-center space-y-4 shadow-xl mb-24">
        <span className="inline-flex items-center gap-1 bg-[#03a9f4]/10 border border-[#03a9f4]/30 text-[#03a9f4] text-[9px] md:text-xs px-3 py-1 rounded-full font-black tracking-widest uppercase">
          <Sparkles className="w-4 h-4 text-[#03a9f4] animate-pulse" />
          FEATURED MATCHUP APPAREL
        </span>
        <h3 className="font-anton text-3xl sm:text-4xl text-white uppercase tracking-wider">
          IT'S A TEAM EFFORT!
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed">
          When your fanbase collectively hits <strong className="text-white font-bold">100 TOTAL TEAM PURCHASES</strong> in a month, every single fan who contributed unlocks premium capsule accessory kits and personalized member certificate packages free!
        </p>
      </div>

      {/* 4. EMBEDDED FAN PARTICIPATION MANUAL (FandomJourney) */}
      <div className="max-w-[1400px] mx-auto pt-10 border-t border-zinc-900/80">
        <div className="text-center mb-10 space-y-2">
          <span className="bg-[#03a9f4]/10 text-[#03a9f4] border border-[#03a9f4]/25 px-3 py-1 rounded text-[10px] font-mono tracking-widest uppercase font-black">
            FAN PARTICIPATION MANUAL
          </span>
          <h3 className="font-anton text-3xl md:text-5xl uppercase tracking-wider text-white">
            FANDOM PROGRESSION PATHWAY
          </h3>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-2xl mx-auto font-light">
            Understand your level of loyalty and unlock premium rewards as you level up your athlete status from catalyst supporter to official league Ambassador.
          </p>
        </div>
        
        <FandomJourney 
          onShowToast={onShowToast}
          onOpenChat={onOpenChat}
          onScrollToCatalog={onScrollToCatalog}
          onAboutOpen={onAboutOpen}
        />
      </div>

      {/* 5. ADD FAN POST MODAL */}
      <AnimatePresence>
        {newPostModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-md w-full overflow-hidden p-6 relative"
            >
              <button 
                onClick={() => setNewPostModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-5">
                <div>
                  <h3 className="font-anton text-2xl uppercase text-[#03a9f4] tracking-wider">
                    POST YOUR GEAR
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
                    JOIN THE 100K CHALLENGE
                  </p>
                </div>

                <form onSubmit={handleSubmitPost} className="space-y-4">
                  {/* Fan Handle */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block">YOUR FAN NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. JerseyPro12"
                      value={newPostUsername}
                      onChange={(e) => setNewPostUsername(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#03a9f4]/40"
                      required
                    />
                  </div>

                  {/* Caption */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block">POST DESCRIPTION</label>
                    <textarea 
                      placeholder="Rocking the limited edition hoodie..."
                      value={newPostCaption}
                      onChange={(e) => setNewPostCaption(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#03a9f4]/40 resize-none"
                      required
                    />
                  </div>

                  {/* Preset Gear Images selectors */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block">SELECT GEAR PHOTOS</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SHOWN_TEAM_IMAGES.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedPresetImage(img)}
                          className={`aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-pointer relative ${
                            selectedPresetImage === img ? "border-[#03a9f4]" : "border-transparent"
                          }`}
                        >
                          <img src={img} alt="Gear option" className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#03a9f4] hover:bg-white text-black hover:text-[#03a9f4] font-black uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    POST TO FAN SHOWCASE
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
