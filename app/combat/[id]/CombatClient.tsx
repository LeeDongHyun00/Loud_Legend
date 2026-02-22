"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MonsterLore } from "@/lib/data/Lore";
import { useVoiceCombat } from "@/hooks/useVoiceCombat";

// ──────────────────────────────────────────────────
// Tutorial Script (only shown when isTutorial=true)
// ──────────────────────────────────────────────────
const TUTORIAL_SCRIPT = [
  {
    text: "이 끔찍한 고요함이 느껴지나? 누군가 이 세계의 모든 소리를 훔쳐가버렸지. 하지만 네 안에는 아직 진동이 남아있다.",
    action: "NEXT",
  },
  {
    text: "이제 싸움의 방식이 완전히 다르다. 단순한 비명이 아닌, '단어의 의미(Word)'와 '기합의 진동(Breath)'을 결합해야 해.",
    action: "NEXT",
  },
  {
    text: "먼저, 가장 기본적인 투기의 구조식을 알려주지. 아래 [▶ 기합 모으기]를 누르고 마이크에 대고 외쳐보게. '받아라, 소닉 펀치!'",
    action: "GATHER_SHOUT",
  },
  {
    text: "문장 끝에 '소닉 펀치', '스매시', '에코 킥' 같은 액션 키워드가 있어야만 마법이 발현된다. 준비됐다면 [⚔️ 파음격 시전]을 눌러!",
    action: "ATTACK",
  },
  {
    text: "훌륭해! 명중했어. 단어의 정확도가 '기본 파괴력'을 결정하고, 외칠 때의 '데시벨(dB)'이 피해량을 증폭시킨다.",
    action: "NEXT",
  },
  {
    text: "훗날 거대한 마법사가 된다면, '공허의 메아리여 침묵을 찢고 창공을 부수어라' 같은 절대 공명기(Ultimate)도 가능하겠지.",
    action: "NEXT",
  },
  {
    text: "단, 그러한 대마법은 최소 80dB 이상의 진동이 뒷받침되어야만 형체를 갖춘다. 자, 이제 진정한 메아리를 찾아 떠나보자!",
    action: "FINALIZE",
  },
];

// ──────────────────────────────────────────────────
// CombatClient — Unified Combat Arena
// ──────────────────────────────────────────────────
export default function CombatClient({
  user,
  targetMonster,
  isTutorial = false,
}: {
  user: any;
  targetMonster: MonsterLore;
  isTutorial?: boolean;
}) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [baseDb, setBaseDb] = useState(30);

  // Game State
  const maxMonsterHp = isTutorial ? 100 : targetMonster.requiredLevel * 100;
  const [monsterHp, setMonsterHp] = useState(maxMonsterHp);
  const [isDead, setIsDead] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([
    `야생의 ${targetMonster.name}이(가) 나타났다!`,
    "단어와 진동(dB)을 결합하여 파음격을 시전하세요.",
  ]);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [activeKeyword, setActiveKeyword] = useState("");
  const [showFleeModal, setShowFleeModal] = useState(false);

  // Tutorial State
  const [tutStep, setTutStep] = useState(0);

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

  // Tutorial: auto-advance when player shouts during GATHER_SHOUT step
  useEffect(() => {
    if (isTutorial && tutStep === 2 && isListening && peakDb > baseDb + 5) {
      setTutStep(3);
    }
  }, [isTutorial, tutStep, isListening, peakDb, baseDb]);

  // ─── Attack Logic ───
  const handleAttack = () => {
    stopListening();

    setTimeout(() => {
      const { damage, logs, matchedKeyword } = calculateDamageInfo(
        targetMonster.name,
      );

      setBattleLogs([logs[0], ...logs.slice(1)]);
      if (matchedKeyword) setActiveKeyword(matchedKeyword);

      if (damage > 0) {
        setLastHitTime(Date.now());
        if (isTutorial) {
          // Tutorial: instant kill on successful hit
          setMonsterHp(0);
          setTutStep(4);
        } else {
          setMonsterHp((prev) => Math.max(0, prev - damage));
        }
      } else if (isTutorial) {
        setBattleLogs([
          "마에스트로: 키워드가 틀렸거나 소리가 너무 작네!",
          "'소닉 펀치'라고 마무리 지어봐!",
        ]);
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
        setLastHitTime(Date.now());
        setMonsterHp((prev) => Math.max(0, prev - damage));
      }

      setTimeout(() => setActiveKeyword(""), 2000);
    }, 100);
  };

  // ─── Victory & EXP Sync ───
  useEffect(() => {
    if (monsterHp <= 0 && !isDead) {
      setIsDead(true);
      if (!isTutorial) {
        handleVictory();
      }
    }
  }, [monsterHp]);

  const handleVictory = async () => {
    stopListening();
    const expGain = isTutorial ? 100 : targetMonster.requiredLevel * 50;
    setBattleLogs(["", "✨ 정적을 깨뜨린 승리! 경험치를 획득합니다."]);

    try {
      const res = await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expGain }),
      });
      const data = await res.json();

      // ★ Critical Fix: Sync the NextAuth JWT session with new EXP/Level
      if (res.ok && data.level != null) {
        await updateSession({ level: data.level, exp: data.exp });
      }
    } catch (e) {
      console.error("EXP save error:", e);
    }

    setTimeout(() => {
      router.push("/map");
      router.refresh();
    }, 3000);
  };

  const handleFlee = () => {
    stopListening();
    router.push("/map");
  };

  // ─── Tutorial Dialogue Handler ───
  const handleTutorialNext = () => {
    const currentScript = TUTORIAL_SCRIPT[tutStep];
    if (!currentScript) return;

    if (currentScript.action === "NEXT") {
      setTutStep(tutStep + 1);
    } else if (currentScript.action === "FINALIZE") {
      handleVictory();
    }
  };

  // ─── Computed Values ───
  const hpPercentage = (monsterHp / maxMonsterHp) * 100;
  const shoutFill = Math.min(
    100,
    Math.max(0, ((currentDb - baseDb) / 70) * 100),
  );

  // Tutorial: gate combat controls behind tutorial steps
  const canResonate = isTutorial ? tutStep >= 2 && tutStep <= 3 : true;
  const canAttack = isTutorial ? tutStep === 3 && !!attackWord : !!attackWord;

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
      <div className="absolute top-0 w-full px-4 md:px-6 py-3 md:py-4 flex justify-between items-start z-50 pointer-events-none">
        {/* Tutorial: Exit Button */}
        {isTutorial && (
          <button
            onClick={() => router.push("/map")}
            className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md border border-amber-500/40 rounded-xl text-amber-200/80 hover:text-amber-400 transition-all text-xs font-bold">
            🚪 나가기
          </button>
        )}
        {!isTutorial && <div />}
        <div className="bg-black/60 p-2 md:p-3 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] border border-amber-500/40 flex flex-col items-end pointer-events-auto backdrop-blur-md">
          <span className="text-[10px] text-amber-400 tracking-widest uppercase font-bold text-glow-gold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            음파 술사
          </span>
          <span className="text-base md:text-lg font-black text-white drop-shadow-md">
            <span className="text-amber-300 mr-1">Lv.{user.level}</span>{" "}
            {user.nickname}
          </span>
        </div>
      </div>

      {/* 3. Center: Monster View Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 pt-16 md:pt-20">
        {/* Monster HP Bar & Name */}
        <div className="flex flex-col items-center mb-4 md:mb-8 relative">
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
            <span className="text-6xl md:text-8xl drop-shadow-lg filter grayscale">
              💀
            </span>
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
                <span className="text-2xl md:text-4xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,1)] rotate-[-15deg]">
                  {activeKeyword}!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* 4. CINEMATIC DIALOGUE HUD (Tutorial Only) */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isTutorial && TUTORIAL_SCRIPT[tutStep] && (
          <motion.div
            key={tutStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 z-40 px-3 md:px-6"
            style={{ bottom: "55%" }}>
            <div className="max-w-md mx-auto bg-black/85 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-start gap-3">
              {/* NPC Avatar */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-[0_0_10px_rgba(245,166,35,0.5)]">
                <Image
                  src="/maestro-npc.png"
                  alt="Maestro"
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>

              {/* Dialogue Content */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-amber-400 font-bold tracking-wider">
                  안내자 마에스트로
                </span>
                <p className="text-sm text-gray-200 leading-relaxed mt-1 break-keep">
                  &ldquo;{TUTORIAL_SCRIPT[tutStep].text}&rdquo;
                </p>

                {/* Dialogue Action Buttons */}
                {TUTORIAL_SCRIPT[tutStep].action === "NEXT" && (
                  <button
                    onClick={handleTutorialNext}
                    className="mt-3 text-xs px-4 py-2 bg-amber-600/80 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors min-h-[36px]">
                    계속 듣는다 →
                  </button>
                )}
                {TUTORIAL_SCRIPT[tutStep].action === "FINALIZE" && (
                  <button
                    onClick={handleTutorialNext}
                    className="mt-3 text-xs px-4 py-2 btn-gold rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.6)] min-h-[36px]">
                    ✨ 운명의 여정을 시작한다
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Bottom: Luminous Command Dashboard */}
      <div className="w-full bg-white/60 backdrop-blur-xl border-t border-white/80 rounded-t-[2rem] md:rounded-t-[3rem] p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] mx-auto max-w-5xl overflow-y-auto max-h-[55svh]">
        {/* Left: Resonance Gauge & STT Text */}
        <div className="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 justify-between">
          {/* Battle Log Box */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 md:p-4 flex-1 flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400" />
            <p className="text-base md:text-lg font-bold text-slate-800 text-center leading-snug break-keep drop-shadow-sm">
              {battleLogs[0]}
            </p>
            {battleLogs[1] && (
              <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2">
                {battleLogs[1]}
              </p>
            )}
          </div>

          {/* STT Lexical Engine Display */}
          <div className="bg-slate-800 rounded-2xl p-4 md:p-5 border-2 border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative flex flex-col h-full z-10">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase">
                  주문 영창 회로
                </span>
                <span className="text-xs text-amber-400 font-bold tracking-wider">
                  PEAK: {Math.round(peakDb)} dB
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-[40px]">
                {attackWord ? (
                  <span className="text-xl md:text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] break-keep text-center leading-tight">
                    &ldquo;{attackWord}&rdquo;
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm font-bold animate-pulse">
                    {isListening ? "진동 감지 중..." : "파음을 멈췄습니다..."}
                  </span>
                )}
              </div>

              {/* Resonance Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full mt-3 md:mt-4 overflow-hidden border border-slate-600 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400"
                  style={{
                    width: `${shoutFill}%`,
                    transition: "width 0.1s ease-out",
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-500/50"
                  style={{ left: `${((80 - baseDb) / 70) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modern Bright Commands */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 md:gap-3 justify-end">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!canResonate || isDead}
            className={`w-full min-h-[48px] py-3 md:py-4 rounded-2xl font-black text-base md:text-lg transition-all shadow-lg ring-2 ring-offset-2 ring-offset-slate-50
                ${
                  !canResonate || isDead
                    ? "bg-slate-300 text-slate-500 ring-slate-200 shadow-none cursor-not-allowed"
                    : isListening
                      ? "bg-red-50 text-red-600 ring-red-400 hover:bg-red-100 shadow-red-200 animate-pulse"
                      : "bg-gradient-to-r from-amber-400 to-amber-500 text-white ring-amber-300 hover:from-amber-500 hover:to-amber-600 shadow-amber-200"
                }`}>
            {isListening
              ? "■ 기합 멈추기 (Recording...)"
              : "▶ 기합 모으기 (Resonate)"}
          </button>
          <div className="flex gap-2">
            {/* Echo Strike — hidden in tutorial */}
            {!isTutorial && (
              <button
                onClick={handleEchoAttack}
                disabled={!isListening || isDead}
                className={`flex-1 min-h-[48px] py-3 md:py-4 rounded-2xl font-black text-sm transition-all shadow-lg text-white ring-2 ring-offset-2 ring-offset-slate-50
                    ${!isListening || isDead ? "bg-slate-300 text-slate-500 ring-slate-200 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-fuchsia-600 ring-purple-400 hover:from-purple-600 hover:to-fuchsia-700 shadow-purple-200"}`}>
                🔊 메아리 <span className="text-[10px] md:text-xs">(Echo)</span>
              </button>
            )}

            {/* STT Attack */}
            <button
              onClick={handleAttack}
              disabled={!canAttack || !isListening || isDead}
              className={`flex-1 min-h-[48px] py-3 md:py-4 rounded-2xl font-black text-sm transition-all shadow-lg text-white ring-2 ring-offset-2 ring-offset-slate-50
                  ${!canAttack || !isListening || isDead ? "bg-slate-300 text-slate-500 ring-slate-200 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-600 ring-cyan-400 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-200"}`}>
              ⚔️ 파음격 시전{" "}
              <span className="text-[10px] md:text-xs">(Lexical)</span>
            </button>
          </div>
          {!isTutorial && (
            <button
              onClick={() => setShowFleeModal(true)}
              className="w-full min-h-[44px] py-3 mt-1 md:mt-2 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 transition-colors shadow-sm">
              🏃 도망치기 (Flee)
            </button>
          )}
        </div>
      </div>

      {/* 6. Flee Confirmation Modal */}
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
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-2xl md:text-3xl mb-4">
                🏃
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 mb-2">
                전투 도주
              </h3>
              <p className="text-sm text-slate-500 mb-5 md:mb-6 font-bold">
                정말 도망치시겠습니까? <br />
                경험치는 저장되지 않습니다.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowFleeModal(false)}
                  className="flex-1 min-h-[44px] py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  취소
                </button>
                <button
                  onClick={handleFlee}
                  className="flex-1 min-h-[44px] py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-200">
                  도망치기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
