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

  useEffect(() => {
    if (status === "authenticated" && typeof window !== "undefined") {
      const hasCalibrated = localStorage.getItem("baseDb");
      if (!hasCalibrated) {
        router.push("/calibration");
      }
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-deep-navy)]">
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
    <main className="relative w-full h-screen overflow-hidden font-sans select-none bg-[var(--color-deep-navy)]">
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
      <div className="absolute inset-y-0 left-4 flex items-center z-40 pointer-events-none">
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

      <div className="absolute inset-y-0 right-4 flex items-center z-40 pointer-events-none">
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

      {/* 4. 상단 좌측: 시련의 전당 (Trial Hub) 진입 */}
      <div className="absolute top-4 left-6 z-50">
        <Link
          href="/trial"
          className="flex items-center gap-3 px-5 py-3 bg-cyan-950/60 backdrop-blur-md border border-cyan-500/50 rounded-2xl text-cyan-100 hover:text-white hover:bg-cyan-900 group transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]">
          <span className="text-2xl group-hover:scale-110 transition-transform text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
            🎙️
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider">
              목소리의 시련
            </span>
          </div>
        </Link>
      </div>

      {/* 5. 좌측 하단 — 튜토리얼 & 설정 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 left-6 z-50 flex gap-4">
        <button
          onClick={() => {
            if (scarecrow) setSelectedMonster(scarecrow);
          }}
          className="group flex flex-col items-center px-4 py-3 panel-fantasy border-amber-500/50 bg-[#0a0e1a]/95 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all hover:scale-105">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
            <Image
              src="/maestro-npc.png"
              alt="maestro"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <span className="text-[10px] text-amber-200 mt-2 tracking-widest font-bold uppercase">
            튜토리얼 다시보기
          </span>
        </button>

        <button
          onClick={() => router.push("/calibration")}
          className="group flex flex-col items-center px-4 py-3 panel-fantasy border-slate-500/50 bg-[#0a0e1a]/95 hover:border-slate-400 hover:shadow-[0_0_20px_rgba(148,163,184,0.4)] transition-all hover:scale-105">
          <div className="w-12 h-12 rounded-full border-2 border-slate-400 overflow-hidden shadow-inner flex items-center justify-center text-slate-300 text-2xl group-hover:rotate-90 transition-transform bg-slate-800">
            ⚙️
          </div>
          <span className="text-[10px] text-slate-300 mt-2 tracking-widest font-bold uppercase">
            음향 설정
          </span>
        </button>
      </motion.div>

      {/* 6. 우측 하단 — Player HUD */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 right-6 z-50 flex items-end gap-3">
        {/* Grimoire Button */}
        <button
          onClick={() => setShowGrimoire(true)}
          className="w-14 h-14 rounded-full bg-[#161b22]/90 border border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center text-2xl hover:bg-[#1a2130] hover:scale-110 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all group">
          <span className="group-hover:rotate-12 transition-transform">📖</span>
        </button>

        {/* Status Window */}
        <div className="panel-fantasy bg-black/60 backdrop-blur-md p-4 w-56 md:w-72 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-amber-500/30 cursor-default">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-[10px] text-amber-400 tracking-widest uppercase font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                음파 술사 (Vocalist)
              </span>
              <h3 className="text-xl font-black text-white drop-shadow-md">
                {userNickname}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                Lv.{userLevel}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2 shadow-inner border border-gray-700 relative overflow-hidden group">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              style={{ width: "45%" }}
            />
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
          </div>
          <p className="text-[9px] text-right text-gray-400 mt-1 uppercase font-bold">
            공명 경험치 (Resonance Exp): 45%
          </p>
        </div>
      </motion.div>

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
