import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  Star, 
  Award, 
  Heart, 
  Trophy, 
  Target, 
  Unlock, 
  Sparkles, 
  Check, 
  ChevronRight,
  Info
} from 'lucide-react';

const STAGES = [
  {
    role: 'Fan',
    label: 'Stage 01: The Catalyst',
    icon: Heart,
    description: 'Driven by the raw passion of the game. Every roar from the stands, every buzzer-beater, and the pure thrill of loyalty start here.',
    highlight: 'Pure Passion',
    requirements: [
      'Follow FanCor Iconz official community hub updates & newsletters.',
      'Choose your favorite standard league fit/jersey from our catalog.',
      'Formally accept the fair play sportsmanship covenant.'
    ],
    perks: [
      'Access to standard fan-zone chats & match commentaries.',
      'Weekly enthusiast email newsletter with design trends.',
      'Instant 5% welcome discount code automatically unlocked.'
    ]
  },
  {
    role: 'Community',
    label: 'Stage 02: The Collective',
    icon: Users,
    description: 'Where individual fandom connects. Building a shared culture of respect, discussion, and collective memory across all leagues.',
    highlight: 'Shared Identity',
    requirements: [
      'Contribute or submit a positive discussion comment on our league feeds.',
      'Acknowledge official community guidelines for positive representation.',
      'Interact with at least three custom setups shared by other fans.'
    ],
    perks: [
      'Participate in community polls deciding upcoming product releases.',
      'Ability to upload and feature your custom fan fits on our main page.',
      '1.1x loyalty multiplier points on future apparel orders.'
    ]
  },
  {
    role: 'Customer',
    label: 'Stage 03: The Representative',
    icon: Target,
    description: 'Wearing your loyalty with pride. Acquiring premium, curated gear that embodies your loyalty and visually supports your team.',
    highlight: 'Quality Pride',
    requirements: [
      'Acquire at least one Official FanCor Premium Jersey or Street Hoody.',
      'Join our loyalty rewards points portal with your verified email.',
      'Upload a proof photo wearing the sports gear to earn your first badge.'
    ],
    perks: [
      'Free express priority shipping upgrades applied to all future orders.',
      'Access to dedicated personal sizing & custom fit consultation team.',
      'Physical customized member-level certificate included in your next box.'
    ]
  },
  {
    role: 'Member',
    label: 'Stage 04: The Insider',
    icon: ShieldCheck,
    description: 'Unlocking exclusive fan perks, game-day discussions, loyalty points, and priority access to limited edition product drops.',
    highlight: 'Exclusive Access',
    requirements: [
      'Accumulate 250 verified fan loyalty experience points (via shop/polls).',
      'Submit a detailed design recommendation for the premium gear collection.',
      'Participate in an exclusive pre-launch preview for retro styles.'
    ],
    perks: [
      'Pre-sale bypass codes to order highly limited capsule products.',
      'Exclusive video lounge invitations during key major game-days.',
      'Quarterly custom accessory gift pack paired with your signature orders.'
    ]
  },
  {
    role: 'Ambassador',
    label: 'Stage 05: The Icon',
    icon: Trophy,
    description: 'Leading and inspiring. Becoming the ultimate representative who elevates the community, champions sportsmanship, and defines brand spirit.',
    highlight: 'Inspiring Leadership',
    requirements: [
      'Champion fair-play and sportsmanship across local/digital forums.',
      'Refer three friends or fellow athletes to join the customized league.',
      'Complete our interactive brand history & sportsmanship values quiz.'
    ],
    perks: [
      'Your own custom verified endorsement landing page & referral codes.',
      '15% flat lifetime merchant discount with first-look product trial packs.',
      'Direct invitation to design roundtables & premium executive meets.'
    ]
  }
];

interface FandomJourneyProps {
  onShowToast: (msg: string) => void;
  onOpenChat: () => void;
  onScrollToCatalog: () => void;
  onAboutOpen: () => void;
}

export function FandomJourney({ onShowToast, onOpenChat, onScrollToCatalog, onAboutOpen }: FandomJourneyProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  // Track checked requirements for EACH stage independently
  const [checkedRequirements, setCheckedRequirements] = useState<{ [key: number]: boolean[] }>({
    0: [false, false, false],
    1: [false, false, false],
    2: [false, false, false],
    3: [false, false, false],
    4: [false, false, false]
  });

  // Track stages that have been officially unlocked
  const [unlockedStages, setUnlockedStages] = useState<number[]>([]); // Initialize empty so all start locked
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedStageName, setCelebratedStageName] = useState('');

  // Handle checking a requirement
  const toggleRequirement = (stageIdx: number, reqIdx: number) => {
    setCheckedRequirements(prev => {
      const current = [...(prev[stageIdx] || [false, false, false])];
      current[reqIdx] = !current[reqIdx];
      return {
        ...prev,
        [stageIdx]: current
      };
    });
  };

  // Check if all requirements are completed for the chosen stage
  const currentStageQuestsCompleted = (stageIdx: number) => {
    const quests = checkedRequirements[stageIdx] || [false, false, false];
    return quests.every(q => q === true);
  };

  // Officially unlock a progression stage!
  const handleUnlockStage = (stageIdx: number) => {
    if (!currentStageQuestsCompleted(stageIdx)) return;
    
    // Add to unlocked list if not already there
    if (!unlockedStages.includes(stageIdx)) {
      setUnlockedStages(prev => [...prev, stageIdx].sort((a, b) => a - b));
    }
    
    // Trigger fun celebration modal/banner
    setCelebratedStageName(STAGES[stageIdx].role);
    setShowCelebration(true);
    onShowToast(`🏆 Stage ${STAGES[stageIdx].role} Activated! Elite perks unlocked.`);
    
    // Auto-advance to the next stage card if available to maintain flow
    if (stageIdx < STAGES.length - 1) {
      setTimeout(() => {
        setActiveTab(stageIdx + 1);
      }, 3000);
    }
  };

  // Reset progress simulator
  const resetSimulator = () => {
    setCheckedRequirements({
      0: [false, false, false],
      1: [false, false, false],
      2: [false, false, false],
      3: [false, false, false],
      4: [false, false, false]
    });
    setUnlockedStages([]);
    setActiveTab(0);
    setCelebratedStageName('');
    setShowCelebration(false);
    onShowToast("🔄 Simulation reset. Start your fandom journey again!");
  };

  // Calculate overall program progress percentage for client representation
  const completedStagesCount = STAGES.filter((_, idx) => unlockedStages.includes(idx)).length;
  const progressPercent = Math.round((completedStagesCount / STAGES.length) * 100);

  return (
    <section className="py-24 px-[5%] max-w-[1400px] mx-auto bg-gradient-to-b from-[#020408] via-[#050912] to-[#03060b] relative overflow-hidden select-none" id="fandom-charter">
      
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#4fc3f7]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Title Headers */}
      <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#4fc3f7]/10 text-[#4fc3f7] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-[#4fc3f7]/20 shadow-lg shadow-black/40">
          <Star className="w-3.5 h-3.5 fill-[#4fc3f7] animate-spin-slow" />
          <span>Fandom Progression Pathway</span>
        </div>
        <h2 className="font-anton text-4xl md:text-6xl text-white uppercase tracking-wider leading-none">
          THE PATH OF <span className="text-[#4fc3f7]">REPRESENTATION</span>
        </h2>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans max-w-3xl mx-auto mt-4">
          Become a key participant in our sports ecosystem. Potential customers can follow the journey step-by-step—advancing from a passionate <strong>Fan</strong> into an influential <strong>Ambassador</strong>. Pick a stage to view requirements, test actions, and unlock elite perks!
        </p>
      </div>

      {/* Overall Global Progress Overview for Potential Participants */}
      <div className="max-w-5xl mx-auto mb-12 bg-black/60 backdrop-blur-md border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4fc3f7]/20 flex items-center justify-center text-[#4fc3f7]">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#4fc3f7] font-semibold">
                Your Interactive Program Simulation
              </p>
            </div>
            <h3 className="font-anton text-xl md:text-2xl text-white uppercase tracking-wide">
              Level Status: <span className="text-[#4fc3f7]">{unlockedStages.length > 0 ? STAGES[unlockedStages[unlockedStages.length - 1]].role : 'LOCKED'}</span>
            </h3>
            <p className="text-xs text-zinc-500 font-sans max-w-lg">
              Check actions inside each stage card below to qualify for active participation. Watch your overall sportsmanship level rise!
            </p>
          </div>
          
          <div className="w-full md:w-80 space-y-3 shrink-0">
            <div className="flex justify-between text-xs font-mono text-zinc-500">
              <span>UNLOCKED REACH: {completedStagesCount} OF {STAGES.length} STAGES</span>
              <span className="text-[#4fc3f7] font-bold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 p-[2px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#4fc3f7] to-[#00e676] rounded-full shadow-[0_0_10px_rgba(79,195,247,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest">
                FAN ➔ AMBASSADOR
              </span>
              <button 
                onClick={resetSimulator}
                className="text-[10px] text-[#4fc3f7]/60 hover:text-[#4fc3f7] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                title="Restart simulation"
              >
                Reset Progression Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Grid & Progression Timelines */}
      <div className="relative mt-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 relative z-10">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeTab === idx;
            const isUnlocked = unlockedStages.includes(idx);
            const verifiedActiveQuests = checkedRequirements[idx] || [false, false, false];
            const checkedCount = verifiedActiveQuests.filter(q => q === true).length;
            const questsAllDone = checkedCount === 3;

            return (
              <div
                key={stage.role}
                onClick={() => setActiveTab(idx)}
                className={`cursor-pointer text-left rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative h-full border ${
                  isSelected 
                    ? 'bg-[#06111f] border-[#4fc3f7]/80 shadow-[0_15px_40px_rgba(79,195,247,0.15)] ring-1 ring-[#4fc3f7]/30 scale-[1.02]' 
                    : 'bg-[#04080e]/60 border-zinc-900 hover:border-zinc-800 shadow-lg'
                }`}
              >
                {/* Visual badge numbers */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {isUnlocked ? (
                    <span className="bg-[#00e676]/10 text-[#00e676] text-[10px] font-mono leading-none px-2 py-1 rounded-full border border-[#00e676]/20 font-bold flex items-center gap-1">
                      ✓ ACTIVE
                    </span>
                  ) : (
                    <span className="bg-zinc-950/80 text-zinc-500 text-[10px] font-mono leading-none px-2 py-1 rounded-full border border-zinc-900 font-bold flex items-center gap-1">
                      🔒 LOCKED
                    </span>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  {/* Icon stage circle with dynamic glowing color */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    isSelected 
                      ? 'bg-[#4fc3f7] text-[#0f2d4a]' 
                      : isUnlocked 
                        ? 'bg-[#00e676]/20 text-[#00e676]' 
                        : 'bg-zinc-950/80 text-zinc-500 border border-zinc-900'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest block font-mono ${
                      isSelected ? 'text-[#4fc3f7]' : 'text-zinc-500'
                    }`}>
                      {stage.label}
                    </span>
                    <h3 className="font-anton text-2xl text-white uppercase leading-none tracking-wide flex items-center gap-1.5">
                      {stage.role}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed min-h-[50px] line-clamp-4">
                    {stage.description}
                  </p>
                </div>

                {/* Progress Mini Status indicator */}
                <div className="mt-6 pt-4 border-t border-zinc-900/60">
                  <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                    <span className="text-zinc-500 uppercase">QUESTS DONE</span>
                    <span className={questsAllDone ? 'text-[#00e676] font-bold' : 'text-[#4fc3f7] font-semibold'}>
                      {checkedCount}/3
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 p-[1px]">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        questsAllDone ? 'bg-[#00e676]' : 'bg-[#4fc3f7]'
                      }`}
                      style={{ width: `${(checkedCount / 3) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500">
                    <span className={isSelected ? 'text-[#4fc3f7]' : ''}>
                      {stage.highlight}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-[#4fc3f7]' : 'text-zinc-600'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quests and Perks Workshop Board */}
      <div className="max-w-6xl mx-auto mt-6 bg-[#03070d]/90 backdrop-blur-md border border-[#4fc3f7]/30 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Neon mesh overlay inside workspace */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4fc3f7]/5 rounded-full blur-[80px]" />
        
        {/* Selected Stage title & highlight badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#4fc3f7] uppercase tracking-widest bg-[#4fc3f7]/10 px-3 py-1 rounded-full border border-[#4fc3f7]/20">
                Active View: Stage 0{activeTab + 1}
              </span>
              {unlockedStages.includes(activeTab) && (
                <span className="text-xs font-mono font-bold text-[#00e676] bg-[#00e676]/10 px-2.5 py-1 rounded-full border border-[#00e676]/20 flex items-center gap-1">
                  ✓ Participant Unlocked
                </span>
              )}
            </div>
            <h3 className="font-anton text-3xl md:text-4xl text-white uppercase tracking-wider">
              {STAGES[activeTab].role} PARTICIPATION MANUAL
            </h3>
          </div>
          
          <div className="text-right">
            <span className="text-xs font-mono text-zinc-500 block uppercase">CORE FOCUS</span>
            <span className="font-anton text-xl md:text-2xl text-[#4fc3f7] uppercase tracking-wide">
              ★ {STAGES[activeTab].highlight}
            </span>
          </div>
        </div>

        {/* Dual column: Quests left vs Perks right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card left: Requirement Checkbox List */}
          <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-anton text-lg tracking-wider text-white uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4fc3f7]" />
                  1. Simulation Quests
                </h4>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-900 font-bold">
                  COMPLETE ALL 3 TO QUALIFY
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-6 font-sans">
                Potential customers are excited to complete these milestones. Try selecting the boxes below to simulate participating directly:
              </p>

              <div className="space-y-4">
                {STAGES[activeTab].requirements.map((req, rIdx) => {
                  const isChecked = (checkedRequirements[activeTab] || [false, false, false])[rIdx];
                  return (
                    <div 
                      key={req}
                      onClick={() => toggleRequirement(activeTab, rIdx)}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-[#4fc3f7]/15 border-[#4fc3f7]/60 shadow-[0_4px_12px_rgba(79,195,247,0.08)]' 
                          : 'bg-zinc-950/80 border-zinc-900 hover:bg-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <button className={`w-5 h-5 rounded-md border shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-[#4fc3f7] border-[#4fc3f7] text-[#0f2d4a]' 
                          : 'border-zinc-800 bg-black/40 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className={`text-xs leading-relaxed font-sans transition-colors ${
                        isChecked ? 'text-white font-medium' : 'text-zinc-400'
                      }`}>
                        {req}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unlock Actions container */}
            <div className="mt-8 pt-6 border-t border-zinc-900/60">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">STAGE ELIGIBILITY STATUS</p>
                  <p className="text-sm font-anton uppercase text-white mt-0.5">
                    {currentStageQuestsCompleted(activeTab) 
                      ? '✓ ELIGIBLE FOR ACTIVE LEVEL' 
                      : '⚠ WORK IN PROGRESS...'}
                  </p>
                </div>

                {unlockedStages.includes(activeTab) ? (
                  <div className="w-full sm:w-auto px-6 py-3 bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/30 text-xs font-bold uppercase tracking-widest rounded-xl text-center shadow-lg">
                    Level Activated & Verified
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {activeTab === 1 && currentStageQuestsCompleted(activeTab) && (
                      <button
                        onClick={onOpenChat}
                        className="px-4 py-3 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Open Coach Cor Chat
                      </button>
                    )}

                    {activeTab === 2 && currentStageQuestsCompleted(activeTab) && (
                      <button
                        onClick={onScrollToCatalog}
                        className="px-4 py-3 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Explore Apparel
                      </button>
                    )}

                    <button
                      onClick={() => handleUnlockStage(activeTab)}
                      disabled={!currentStageQuestsCompleted(activeTab)}
                      className={`w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl text-center transition-all shadow-md flex items-center justify-center gap-2 ${
                        currentStageQuestsCompleted(activeTab)
                          ? 'bg-[#4fc3f7] text-[#0f2d4a] hover:bg-white hover:scale-105 cursor-pointer shadow-[#4fc3f7]/30'
                          : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Unlock {STAGES[activeTab].role} Stage
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card right: Exclusive Perks & Participant benefits */}
          <div className="bg-gradient-to-br from-[#06101c] to-[#03060b] border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-anton text-lg tracking-wider text-white uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e676]" />
                  2. Elite Unlockable Perks
                </h4>
                <Award className="w-5 h-5 text-[#4fc3f7] animate-pulse" />
              </div>
              <p className="text-xs text-zinc-500 font-sans">
                Potential customers on this platform gain immediate, lifetime access to these premium privileges upon activating respective stage levels:
              </p>

              <div className="space-y-4">
                {STAGES[activeTab].perks.map((perk, pIdx) => (
                  <div key={perk} className="flex items-start gap-3 bg-black/35 border border-zinc-900 p-4 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-[#4fc3f7]/10 border border-[#4fc3f7]/25 flex items-center justify-center text-[#4fc3f7] shrink-0 font-mono text-xs font-bold mt-0.5">
                      0{pIdx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                        {perk}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900/65 bg-[#4fc3f7]/5 p-4 rounded-xl border border-[#4fc3f7]/10 flex items-center gap-3">
              <Info className="w-4 h-4 text-[#4fc3f7] shrink-0" />
              <p className="text-[11px] text-zinc-300 leading-normal font-sans">
                <strong>Why Participate?</strong> Building active representation makes you more than a buyer. It awards verified league badges, unlocks priority drops, and connects you directly to team designs!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Celebration Success Popup Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-[#06111f] to-[#03060b] border-2 border-[#4fc3f7] rounded-3xl p-8 md:p-12 text-center max-w-lg w-full relative shadow-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#4fc3f7] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#4fc3f7]/40">
                <Trophy className="w-9 h-9 animate-bounce" />
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex justify-center gap-1">
                  <Sparkles className="w-6 h-6 text-[#4fc3f7] animate-pulse" />
                  <Sparkles className="w-6 h-6 text-[#00e676] animate-pulse" />
                </div>
                
                <h3 className="font-anton text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                  STAGE {celebratedStageName} UNLOCKED!
                </h3>
                
                <p className="text-zinc-300 text-sm font-sans leading-relaxed">
                  Congratulations! You have simulated the requirements and successfully progressed to the <strong className="text-white">{celebratedStageName}</strong> level of Fandom Representation!
                </p>

                <div className="bg-black/50 p-4 rounded-xl border border-zinc-900">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest font-bold">
                    Milestone Level Reached
                  </p>
                  <p className="text-[#00e676] font-bold text-sm sm:text-base mt-1 uppercase tracking-wider">
                    ✓ {celebratedStageName} Participant Access Granted
                  </p>
                </div>

                <button
                  onClick={() => setShowCelebration(false)}
                  className="px-8 py-3.5 bg-[#4fc3f7] hover:bg-white text-black hover:text-[#0f2d4a] uppercase font-bold text-xs tracking-widest rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assertive Sportsmanship Creed Info Banner */}
      <div className="mt-16 bg-gradient-to-r from-[#05101c] to-[#02050b] border border-[#4fc3f7]/20 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4fc3f7]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />

        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#4fc3f7]/10 text-[#4fc3f7] rounded-2xl flex items-center justify-center shrink-0 border border-[#4fc3f7]/25 shadow-xl">
          <Award className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-4 relative z-10 flex-1 text-center lg:text-left">
          <h3 className="font-anton text-2xl md:text-3xl text-white uppercase tracking-wider">
            THE SPORTSMANSHIP COVENANT
          </h3>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-4xl font-sans">
            Whether we are sporting Jerseys, Hoodies, or custom street fits, our gear represents more than our athletic icons. It represents fair play, integrity, community leadership, and elevating fandom into active, positive sportsmanship. We wear the shield of unity.
          </p>
        </div>

        <div className="mt-4 lg:mt-0 relative z-10">
          <button
            onClick={onAboutOpen}
            className="px-6 py-4 bg-[#4fc3f7] text-black hover:bg-white hover:text-[#0f2d4a] duration-300 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg text-center whitespace-nowrap cursor-pointer transition-all hover:scale-105"
          >
            Read Our Story
          </button>
        </div>
      </div>

    </section>
  );
}
