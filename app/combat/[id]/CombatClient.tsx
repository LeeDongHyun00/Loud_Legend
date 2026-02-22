"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MonsterLore } from "@/lib/data/Lore";
import { useVoiceCombat } from "@/hooks/useVoiceCombat";

export default function CombatClient({
  user,
  targetMonster,
}: {
  user: any;
  targetMonster: MonsterLore;
}) {
  const router = useRouter();
  const [baseDb, setBaseDb] = useState(30);

  // Game State
  const maxMonsterHp = targetMonster.requiredLevel * 100;
  const [monsterHp, setMonsterHp] = useState(maxMonsterHp);
  const [isDead, setIsDead] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([
    `야생의 ${targetMonster.name}이(가) 나타났다!`,
    "단어와 진동(dB)을 결합하여 파음격을 시전하세요.",
  ]);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [activeKeyword, setActiveKeyword] = useState("");
  const [showFleeModal, setShowFleeModal] = useState(false);

  const {
    currentDb,
    peakDb,
    attackWord,
    isListening,
    startListening,
    stopListening,
    calculateDamageInfo,
    calculateEchoDamage,
  } = useVoiceCombat(user.classId || "commoner", baseDb);

  useEffect(() => {
    const savedBaseDb = localStorage.getItem("baseDb");
    if (savedBaseDb) {
      setBaseDb(parseInt(savedBaseDb, 10));
    }
  }, []);

  const handleAttack = () => {
    stopListening();

    setTimeout(() => {
      const { damage, logs, matchedKeyword } = calculateDamageInfo(
        targetMonster.name,
      );

      setBattleLogs([logs[0], ...logs.slice(1)]);
      if (matchedKeyword) setActiveKeyword(matchedKeyword);

      if (damage > 0) {
        setLastHitTime(Date.now()); // Trigger hit animation
        setMonsterHp((prev) => Math.max(0, prev - damage));
      }

      setTimeout(() => setActiveKeyword(""), 2000);
    }, 100);
  };

  const handleEchoAttack = () => {
    stopListening();

    setTimeout(() => {
      const { damage, logs } = calculateEchoDamage();

      setBattleLogs([logs[0], ...logs.slice(1)]);
      setActiveKeyword("메아리!");

      if (damage > 0) {
        setLastHitTime(Date.now()); // Trigger hit animation
        setMonsterHp((prev) => Math.max(0, prev - damage));
      }

      setTimeout(() => setActiveKeyword(""), 2000);
    }, 100);
  };

  useEffect(() => {
    if (monsterHp <= 0 && !isDead) {
      setIsDead(true);
      handleVictory();
    }
  }, [monsterHp]);

  const handleVictory = async () => {
    stopListening();
    setBattleLogs(["", "✨ 정적을 깨뜨린 승리! 경험치를 획득합니다."]);

    try {
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expGain: targetMonster.requiredLevel * 50 }),
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      alert("승리! 월드맵으로 복귀합니다.");
      router.push("/map");
      router.refresh();
    }, 3000);
  };

  const handleFlee = () => {
    stopListening();
    router.push("/map");
  };

  const hpPercentage = (monsterHp / maxMonsterHp) * 100;
  // Calculate Resonance Meter fill percentage
  const shoutFill = Math.min(
    100,
    Math.max(0, ((currentDb - baseDb) / 70) * 100),
  );

  const getBiomeBackground = (biome: string) => {
    switch (biome) {
      case "The Verdant Whispers":
        return {
          gradient: "from-emerald-900 via-teal-800 to-green-900 opacity-90",
          img: "/backgrounds/bg_verdant.png",
        };
      case "The Wailing Galleon":
        return {
          gradient: "from-blue-950 via-cyan-900 to-sky-900 opacity-90",
          img: "/backgrounds/bg_galleon.png",
        };
      case "The Bellowing Tundra":
        return {
          gradient: "from-slate-900 via-blue-900 to-sky-800 opacity-90",
          img: "/backgrounds/bg_tundra.png",
        };
      case "The Muted Marshes":
        return {
          gradient: "from-purple-950 via-fuchsia-950 to-black opacity-90",
          img: "/backgrounds/bg_marshes.png",
        };
      default:
        return {
          gradient: "from-gray-900 via-slate-800 to-black opacity-90",
          img: "",
        };
    }
  };

  const currentBiomeBg = getBiomeBackground(targetMonster.biome);

  const getBiomeLuminousAccent = (biome: string) => {
    switch (biome) {
      case "The Verdant Whispers":
        return "shadow-[0_20px_50px_rgba(52,211,153,0.2)] border-emerald-500/30";
      case "The Wailing Galleon":
        return "shadow-[0_20px_50px_rgba(34,211,238,0.2)] border-cyan-500/30";
      case "The Bellowing Tundra":
        return "shadow-[0_20px_50px_rgba(186,230,253,0.2)] border-sky-500/30";
      case "The Muted Marshes":
        return "shadow-[0_20px_50px_rgba(217,70,239,0.2)] border-fuchsia-500/30";
      default:
        return "shadow-[0_20px_50px_rgba(251,191,36,0.2)] border-amber-500/30";
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black font-sans select-none overflow-hidden relative">
      {/* 1. Dynamic Luminous Background & Image Fix */}
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: currentBiomeBg.img
            ? `url('${currentBiomeBg.img}')`
            : "none",
        }}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentBiomeBg.gradient} pointer-events-none z-0 mix-blend-multiply`}
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay pointer-events-none z-0" />

      {/* 2. Top Header - Player Info */}
      <div className="absolute top-0 w-full px-6 py-4 flex justify-between items-start z-50 pointer-events-none">
        <div />
        <div className="bg-black/60 p-3 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] border border-amber-500/40 flex flex-col items-end pointer-events-auto backdrop-blur-md">
          <span className="text-[10px] text-amber-400 tracking-widest uppercase font-bold text-glow-gold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            음파 술사 (Vocalist)
          </span>
          <span className="text-lg font-black text-white drop-shadow-md">
            <span className="text-amber-300 mr-1">Lv.{user.level}</span>{" "}
            {user.nickname}
          </span>
        </div>
      </div>

      {/* 3. Center: Monster View Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 pt-16 md:pt-20">
        {/* Monster HP Bar & Name */}
        <div className="flex flex-col items-center mb-8 relative">
          <h2 className="text-lg md:text-2xl font-black text-white tracking-widest mb-2 md:mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] flex items-center gap-2 md:gap-3">
            <span className="w-8 md:w-12 h-[2px] bg-amber-400"></span>
            {targetMonster.name}
            <span className="w-8 md:w-12 h-[2px] bg-amber-400"></span>
          </h2>
          <div className="w-full max-w-xs bg-gray-900 rounded-full h-3 shadow-[0_0_10px_rgba(0,0,0,0.8)_inner] relative overflow-hidden border border-gray-700">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              animate={{ width: `${hpPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs font-bold text-gray-300 mt-1">
            {Math.round(monsterHp)} / {maxMonsterHp}
          </span>
        </div>

        {/* Monster Sprite (Luminous Container) */}
        <motion.div
          key={lastHitTime}
          initial={
            isDead
              ? { opacity: 0 }
              : { scale: 1, filter: "brightness(1) contrast(1)" }
          }
          animate={
            isDead
              ? {
                  scale: 0,
                  opacity: 0,
                  rotate: 180,
                  filter: "brightness(3)",
                  transition: { duration: 1 },
                }
              : lastHitTime
                ? {
                    x: [-15, 15, -15, 15, 0],
                    filter: [
                      "brightness(2) drop-shadow(0 0 40px rgba(251,191,36,0.8))",
                      "brightness(1) drop-shadow(0 0 20px rgba(251,191,36,0.2))",
                    ],
                    transition: { duration: 0.4 },
                  }
                : {
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 2.5 },
                  }
          }
          className={`relative w-40 h-40 md:w-72 md:h-72 rounded-full border-[2px] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden z-20 ${getBiomeLuminousAccent(targetMonster.biome)}`}>
          {isDead ? (
            <span className="text-8xl drop-shadow-lg filter grayscale">💀</span>
          ) : (
            <Image
              src={targetMonster.image}
              alt={targetMonster.name}
              fill
              className="object-cover p-2 rounded-full transform scale-110"
              priority
              draggable={false}
            />
          )}

          {/* Active Keyword Hit Effect Overlay */}
          <AnimatePresence>
            {activeKeyword && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <span className="text-4xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,1)] rotate-[-15deg]">
                  {activeKeyword}!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. Bottom: Luminous Command Dashboard */}
      <div className="w-full bg-white/60 backdrop-blur-xl border-t border-white/80 rounded-t-[2rem] md:rounded-t-[3rem] p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] mx-auto max-w-5xl overflow-y-auto max-h-[55svh]">
        {/* Left: Resonance Gauge & STT Text */}
        <div className="w-full md:w-1/2 flex flex-col gap-4 justify-between">
          {/* Battle Log Box */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex-1 flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400" />
            <p className="text-lg font-bold text-slate-800 text-center leading-snug break-keep drop-shadow-sm">
              {battleLogs[0]}
            </p>
            {battleLogs[1] && (
              <p className="text-sm text-slate-500 mt-2">{battleLogs[1]}</p>
            )}
          </div>

          {/* STT Lexical Engine Display */}
          <div className="bg-slate-800 rounded-2xl p-5 border-2 border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative flex flex-col h-full z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase">
                  주문 영창 회로 (Lexical Circuit)
                </span>
                <span className="text-xs text-amber-400 font-bold tracking-wider">
                  PEAK: {Math.round(peakDb)} dB
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {attackWord ? (
                  <span className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] break-keep text-center leading-tight">
                    "{attackWord}"
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm font-bold animate-pulse">
                    {isListening ? "진동 감지 중..." : "파음을 멈췄습니다..."}
                  </span>
                )}
              </div>

              {/* Resonance Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full mt-4 overflow-hidden border border-slate-600 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400"
                  style={{
                    width: `${shoutFill}%`,
                    transition: "width 0.1s ease-out",
                  }}
                />
                {/* Threshold Marker Example */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-500/50"
                  style={{ left: `${((80 - baseDb) / 70) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modern Bright Commands */}
        <div className="w-full md:w-1/2 flex flex-col gap-3 justify-end">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ring-2 ring-offset-2 ring-offset-slate-50
                ${
                  isListening
                    ? "bg-red-50 text-red-600 ring-red-400 hover:bg-red-100 shadow-red-200 animate-pulse"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 text-white ring-amber-300 hover:from-amber-500 hover:to-amber-600 shadow-amber-200"
                }`}>
            {isListening
              ? "■ 기합 멈추기 (Recording...)"
              : "▶ 기합 모으기 (Resonate)"}
          </button>
          <div className="flex gap-2">
            {/* Echo Strike */}
            <button
              onClick={handleEchoAttack}
              disabled={!isListening || isDead}
              className={`flex-1 py-4 rounded-2xl font-black text-sm md:text-md transition-all shadow-lg text-white ring-2 ring-offset-2 ring-offset-slate-50
                  ${!isListening || isDead ? "bg-slate-300 text-slate-500 ring-slate-200 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-fuchsia-600 ring-purple-400 hover:from-purple-600 hover:to-fuchsia-700 shadow-purple-200"}`}>
              🔊 원초적 메아리 <br className="md:hidden" />
              <span className="text-[10px] md:text-xs"> (Echo Strike)</span>
            </button>

            {/* STT Attack */}
            <button
              onClick={handleAttack}
              disabled={!isListening || isDead || !attackWord}
              className={`flex-1 py-4 rounded-2xl font-black text-sm md:text-md transition-all shadow-lg text-white ring-2 ring-offset-2 ring-offset-slate-50
                  ${!isListening || isDead || !attackWord ? "bg-slate-300 text-slate-500 ring-slate-200 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-600 ring-cyan-400 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-200"}`}>
              ⚔️ 파음격 시전 <br className="md:hidden" />
              <span className="text-[10px] md:text-xs"> (Lexical)</span>
            </button>
          </div>
          <button
            onClick={() => setShowFleeModal(true)}
            className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 transition-colors shadow-sm">
            🏃 도망치기 (Flee)
          </button>
        </div>
      </div>

      {/* 5. Flee Confirmation Modal */}
      <AnimatePresence>
        {showFleeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4">
                🏃
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                전투 도주
              </h3>
              <p className="text-sm text-slate-500 mb-6 font-bold">
                정말 도망치시겠습니까? <br />
                진행 상황과 경험치는 저장되지 않습니다.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowFleeModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  취소 (Cancel)
                </button>
                <button
                  onClick={handleFlee}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-200">
                  도망치기 (Flee)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
