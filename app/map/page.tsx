"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MonsterLore, MONSTERS } from "@/lib/data/Lore";
import LoreModal from "@/components/LoreModal";
import GrimoireModal from "@/components/GrimoireModal";

const STAGES = [
  {
    id: 0,
    name: "속삭이는 신록",
    biome: "The Verdant Whispers",
    offset: { x: "0vw", y: "0vh" },
  },
  {
    id: 1,
    name: "통곡의 갤리온",
    biome: "The Wailing Galleon",
    offset: { x: "-50vw", y: "-60vh" },
  },
  {
    id: 2,
    name: "호령하는 설원",
    biome: "The Bellowing Tundra",
    offset: { x: "-100vw", y: "-10vh" },
  },
  {
    id: 3,
    name: "묵음의 늪지대",
    biome: "The Muted Marshes",
    offset: { x: "10vw", y: "-110vh" },
  },
];

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedMonster, setSelectedMonster] = useState<MonsterLore | null>(
    null,
  );
  const [currentStage, setCurrentStage] = useState(0);
  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);

  const INTRO_SCRIPT = [
    {
      text: "오오... 이 놀라운 파동은...! 거짓말이 아니었어. 천 년의 침묵을 찢고 드디어 그대가 강림했군.",
    },
    {
      text: "이 세계는 '거대한 침묵(The Silence)'이라는 부패에 의해 모든 색과 소리를 빼앗기고 있다네. 오직 그대만이, 이 저주받은 운명을 깰 '마지막 메아리(The Last Echo)'라네.",
    },
    {
      text: "설명할 시간이 없네! 침묵의 군단이 그대의 빛나는 파동을 감지하고 몰려오기 시작했어. 어서 나를 따라 '훈련장(Training Grounds)'으로 오게. 그대의 진정한 목소리를 일깨워주지!",
    },
  ];

  useEffect(() => {
    if (status === "authenticated" && typeof window !== "undefined") {
      const hasCalibrated = localStorage.getItem("baseDb");
      if (!hasCalibrated) {
        router.push("/calibration");
      } else if (session?.user?.exp === 0) {
        setShowIntro(true);
      }
    }
  }, [status, router, session]);

  if (status === "loading") {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-[var(--color-deep-navy)]">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xl text-amber-400 font-bold">
          ✨ 월드 맵 로딩 중...
        </motion.div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const userLevel = session.user?.level || 1;
  const userNickname = session.user?.nickname || "전사님";

  const mapMonsters = MONSTERS.filter((m) => m.id !== "scarecrow");
  const scarecrow = MONSTERS.find((m) => m.id === "scarecrow");

  const getNodeStyle = (monster: MonsterLore) => {
    switch (monster.type) {
      case "고급 보스":
        return "border-purple-500 bg-purple-900/90 shadow-[0_0_30px_rgba(168,85,247,0.7)] text-purple-200";
      case "중급 보스":
        return "border-orange-500 bg-orange-900/90 shadow-[0_0_25px_rgba(249,115,22,0.6)] text-orange-200";
      case "발음 던전":
        return "border-cyan-400 bg-cyan-900/90 shadow-[0_0_25px_rgba(34,211,238,0.6)] text-cyan-200";
      default:
        return "border-amber-400 bg-amber-900/90 shadow-[0_0_20px_rgba(251,191,36,0.6)] text-amber-200";
    }
  };

  const handleNextStage = () =>
    setCurrentStage((prev) => Math.min(STAGES.length - 1, prev + 1));
  const handlePrevStage = () =>
    setCurrentStage((prev) => Math.max(0, prev - 1));

  const activeStage = STAGES[currentStage];

  return (
    <main className="relative w-full h-[100svh] overflow-hidden font-sans select-none bg-[var(--color-deep-navy)]">
      {/* 1. Stage-Based Map Container (Animated pan & zoom) */}
      <motion.div
        animate={{
          x: activeStage.offset.x,
          y: activeStage.offset.y,
          scale: 1.1,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 60, mass: 1.5 }}
        className="absolute w-[200vw] h-[200vh] z-10 origin-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/world-map-bg.png"
            alt="World Map"
            fill
            className="object-cover"
            priority
            draggable={false}
          />
          <div className="absolute inset-0 bg-[var(--color-deep-navy)]/30" />
        </div>

        {mapMonsters.map((monster) => {
          const isLocked = userLevel < monster.requiredLevel;
          // Determine if this monster belongs to the current stage biome
          const isCurrentBiome = monster.biome === activeStage.biome;

          return (
            <motion.div
              key={monster.id}
              className="absolute"
              style={{
                left: `${monster.position.x}%`,
                top: `${monster.position.y}%`,
                transform: "translate(-50%, -50%)",
              }}>
              <motion.button
                disabled={isLocked}
                onClick={() => setSelectedMonster(monster)}
                whileHover={!isLocked ? { scale: 1.15 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                animate={{ opacity: isCurrentBiome ? 1 : 0.4 }}
                transition={{ duration: 0.5 }}
                className={`w-[80px] h-[80px] rounded-full border-[4px] flex items-center justify-center transition-colors group relative cursor-pointer
                  ${isLocked ? "bg-gray-800/90 border-gray-600 grayscale shadow-none" : getNodeStyle(monster)}`}>
                {!isLocked && isCurrentBiome && (
                  <div className="absolute inset-0 rounded-full border border-current animate-ping opacity-30 pointer-events-none" />
                )}

                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center p-1 z-10 bg-black/40">
                  {isLocked ? (
                    <span className="text-3xl drop-shadow-md">🔒</span>
                  ) : (
                    <Image
                      src={monster.image}
                      alt={monster.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover filter contrast-125"
                      draggable={false}
                    />
                  )}
                </div>

                {isCurrentBiome && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap panel-fantasy px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 border-b-2">
                    <p className="text-sm font-bold text-amber-400">
                      {monster.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {isLocked
                        ? `🔒 요구 레벨: ${monster.requiredLevel}`
                        : `탐색 지역: ${monster.biome}`}
                    </p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-t-[rgba(10,14,26,0.92)] border-l-transparent border-r-transparent" />
                  </div>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 2. Stage Navigation UI (Left / Right) */}
      <div className="absolute inset-y-0 left-4 flex items-center z-50 pointer-events-none">
        <AnimatePresence>
          {currentStage > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={handlePrevStage}
              className="pointer-events-auto panel-fantasy bg-black/70 p-4 border-amber-500/50 hover:border-amber-400 hover:bg-black/90 group flex flex-col items-center gap-2 transition-all hover:scale-110 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
              <span className="text-amber-400 text-3xl group-hover:-translate-x-2 transition-transform">
                ◀
              </span>
              <span className="text-[10px] text-amber-200/70 uppercase tracking-widest font-bold hidden md:block">
                이전 지역
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center z-50 pointer-events-none">
        <AnimatePresence>
          {currentStage < STAGES.length - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={handleNextStage}
              className="pointer-events-auto panel-fantasy bg-black/70 p-4 border-amber-500/50 hover:border-amber-400 hover:bg-black/90 group flex flex-col items-center gap-2 transition-all hover:scale-110 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
              <span className="text-[10px] text-amber-200/70 uppercase tracking-widest font-bold hidden md:block">
                다음 지역
              </span>
              <span className="text-amber-400 text-3xl group-hover:translate-x-2 transition-transform">
                ▶
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Stage Indicator */}
      <div className="absolute top-[12vh] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-fantasy px-8 py-3 bg-black/60 backdrop-blur-md border-amber-500/40 shadow-2xl flex flex-col items-center">
          <span className="text-xs text-amber-200/70 tracking-[0.3em] uppercase mb-1">
            {activeStage.biome}
          </span>
          <span className="text-2xl font-bold text-amber-400 text-glow-gold tracking-widest">
            {activeStage.name}
          </span>
        </motion.div>
      </div>

      {/* ═══ 4A. MOBILE Bottom Dock (hidden on md+) ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-3 mb-2 panel-fantasy bg-black/70 backdrop-blur-md p-3 px-4 flex items-center justify-between border border-amber-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <span className="text-xs text-amber-400 font-bold tracking-wider truncate">
              Lv.{userLevel}
            </span>
            <span className="text-sm font-black text-white truncate">
              {userNickname}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-20 bg-gray-900 rounded-full h-2 border border-gray-700 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                style={{ width: "45%" }}
              />
            </div>
            <span className="text-[9px] text-gray-400 font-bold">EXP</span>
          </div>
        </div>
        <div className="mx-3 mb-3 grid grid-cols-4 gap-2">
          <button
            onClick={() => setShowGrimoire(true)}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 panel-fantasy bg-black/70 backdrop-blur-md border-amber-500/40 hover:border-amber-400 hover:bg-black/90 transition-all active:scale-95">
            <span className="text-xl">📖</span>
            <span className="text-[9px] text-amber-200 font-bold tracking-wider">
              마도서
            </span>
          </button>
          <button
            onClick={() => router.push("/trial")}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 panel-fantasy bg-cyan-950/60 backdrop-blur-md border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-900/80 transition-all active:scale-95">
            <span className="text-xl">🎙️</span>
            <span className="text-[9px] text-cyan-200 font-bold tracking-wider">
              시련
            </span>
          </button>
          <button
            onClick={() => router.push("/calibration")}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 panel-fantasy bg-black/70 backdrop-blur-md border-slate-500/40 hover:border-slate-400 hover:bg-black/90 transition-all active:scale-95">
            <span className="text-xl">⚙️</span>
            <span className="text-[9px] text-slate-300 font-bold tracking-wider">
              설정
            </span>
          </button>
          <button
            onClick={() => {
              if (scarecrow) setSelectedMonster(scarecrow);
            }}
            className="min-h-[56px] flex flex-col items-center justify-center gap-1 panel-fantasy bg-black/70 backdrop-blur-md border-amber-500/40 hover:border-amber-400 hover:bg-black/90 transition-all active:scale-95">
            <span className="text-xl">🪗</span>
            <span className="text-[9px] text-amber-200 font-bold tracking-wider">
              훈련
            </span>
          </button>
        </div>
      </div>

      {/* ═══ 4B. DESKTOP Left Sidebar (hidden on mobile) ═══ */}
      <div className="hidden md:flex absolute bottom-6 left-8 z-40 w-72 flex-col gap-3 h-fit max-h-[calc(100vh-3rem)]">
        {/* Player Status Panel */}
        <div className="panel-fantasy bg-black/70 backdrop-blur-xl p-5 border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-amber-400 tracking-widest uppercase font-bold block">
                음파 술사 (Vocalist)
              </span>
              <span className="text-lg font-black text-white">
                {userNickname}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-amber-400 font-black text-xl">
              Lv.{userLevel}
            </span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2.5 border border-gray-700 relative overflow-hidden mb-1">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              style={{ width: "45%" }}
            />
          </div>
          <p className="text-[10px] text-right text-gray-400 font-bold uppercase">
            공명 경험치: 45%
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setShowGrimoire(true)}
            className="flex items-center gap-3 px-4 py-3 panel-fantasy bg-black/70 backdrop-blur-md border-amber-500/40 hover:border-amber-400 hover:bg-black/90 transition-all hover:scale-[1.02]">
            <span className="text-2xl">📖</span>
            <div className="flex flex-col items-start">
              <span className="text-sm text-amber-200 font-bold">마도서</span>
              <span className="text-[10px] text-gray-500">
                Attack Compendium
              </span>
            </div>
          </button>
          <button
            onClick={() => router.push("/trial")}
            className="flex items-center gap-3 px-4 py-3 panel-fantasy bg-cyan-950/60 backdrop-blur-md border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-900/80 transition-all hover:scale-[1.02]">
            <span className="text-2xl">🎙️</span>
            <div className="flex flex-col items-start">
              <span className="text-sm text-cyan-200 font-bold">
                목소리의 시련
              </span>
              <span className="text-[10px] text-gray-500">
                Trial of the Voice
              </span>
            </div>
          </button>
          <button
            onClick={() => router.push("/calibration")}
            className="flex items-center gap-3 px-4 py-3 panel-fantasy bg-black/70 backdrop-blur-md border-slate-500/40 hover:border-slate-400 hover:bg-black/90 transition-all hover:scale-[1.02]">
            <span className="text-2xl">⚙️</span>
            <div className="flex flex-col items-start">
              <span className="text-sm text-slate-300 font-bold">
                음향 설정
              </span>
              <span className="text-[10px] text-gray-500">
                Audio Calibration
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              if (scarecrow) setSelectedMonster(scarecrow);
            }}
            className="flex items-center gap-3 px-4 py-3 panel-fantasy bg-black/70 backdrop-blur-md border-amber-500/40 hover:border-amber-400 hover:bg-black/90 transition-all hover:scale-[1.02]">
            <span className="text-2xl">🪗</span>
            <div className="flex flex-col items-start">
              <span className="text-sm text-amber-200 font-bold">튜토리얼</span>
              <span className="text-[10px] text-gray-500">Training Replay</span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══ FIRST-TIME INTRO MODAL ═══ */}
      <AnimatePresence>
        {showIntro && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              key={introStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl w-full panel-fantasy bg-black/90 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-amber-500/50 shadow-[0_0_50px_rgba(245,166,35,0.3)] text-center md:text-left relative overflow-hidden">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-[0_0_15px_rgba(245,166,35,0.6)]">
                <Image
                  src="/maestro-npc.png"
                  alt="Maestro"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col items-center md:items-start">
                <span className="text-sm font-bold text-amber-500 tracking-widest uppercase mb-1 drop-shadow-md">
                  안내자 마에스트로
                </span>
                <p className="text-base md:text-lg text-gray-200 leading-relaxed break-keep font-medium min-h-[5rem]">
                  &ldquo;{INTRO_SCRIPT[introStep].text}&rdquo;
                </p>
                <button
                  onClick={() => {
                    if (introStep < INTRO_SCRIPT.length - 1) {
                      setIntroStep((prev) => prev + 1);
                    } else {
                      setShowIntro(false);
                      if (scarecrow) setSelectedMonster(scarecrow);
                    }
                  }}
                  className={`mt-6 px-6 py-3 rounded-xl font-bold transition-all ${
                    introStep === INTRO_SCRIPT.length - 1
                      ? "btn-gold shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
                      : "bg-gray-800 hover:bg-gray-700 text-amber-200 border border-amber-500/30"
                  }`}>
                  {introStep === INTRO_SCRIPT.length - 1
                    ? "✨ 훈련장으로 이동하여 서막을 연다"
                    : "계속 듣는다 →"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NPC 모달 */}
      <AnimatePresence>
        {selectedMonster && (
          <LoreModal
            monster={selectedMonster}
            nickname={userNickname}
            onClose={() => setSelectedMonster(null)}
          />
        )}
      </AnimatePresence>

      {/* 마도서 (Grimoire) 모달 */}
      <AnimatePresence>
        {showGrimoire && (
          <GrimoireModal onClose={() => setShowGrimoire(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
