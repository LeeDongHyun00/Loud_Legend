"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MonsterLore } from "@/lib/data/Lore";
import { useVoiceCombat } from "@/hooks/useVoiceCombat";
import Image from "next/image";

const TUTORIAL_SCRIPT = [
  {
    text: "이 끔찍한 고요함이 느껴지나? 누군가 이 세계의 모든 소리를 훔쳐가버렸지. 하지만 네 안에는 아직 진동이 남아있다.",
    actionRequired: "NEXT",
  },
  {
    text: "이제 싸움의 방식이 완전히 다르다. 단순한 비명이 아닌, '단어의 의미(Word)'와 '기합의 진동(Breath)'을 결합해야 해.",
    actionRequired: "NEXT",
  },
  {
    text: "먼저, 가장 기본적인 투기의 구조식을 알려주지. 문장의 끝맺음이 중요해. 아래 [▶ 기합 모으기]를 누르고 마이크에 대고 외쳐보게. '받아라, 소닉 펀치!'",
    actionRequired: "GATHER_SHOUT",
  },
  {
    text: "내 말이 잘 담겼나 확인해 봐! 문장 끝에 '소닉 펀치', '스매시', '에코 킥' 같은 액션 키워드가 있어야만 마법이 발현된다. 준비됐다면 [⚔️ 파음격 발동]을 눌러!",
    actionRequired: "ATTACK",
  },
  {
    text: "아주 훌륭해! 명중했어. 명심해라. 단어의 정확도가 '기본 파괴력'을 결정하고, 외칠 때의 '데시벨(dB)'이 피해량을 기하급수적으로 증폭시킨다.",
    actionRequired: "NEXT",
  },
  {
    text: "훗날 네가 거대한 마법사가 된다면... '공허의 메아리여 침묵을 찢고 창공을 부수어라' 같은 절대 공명기(Ultimate)를 발동할 수도 있겠지.",
    actionRequired: "NEXT",
  },
  {
    text: "단, 그러한 대마법은 최소 80dB 이상의 거대한 진동이 뒷받침되어야만 형체를 갖춘다. 자, 이제 진정한 메아리를 찾아 떠나보자!",
    actionRequired: "FINALIZE",
  },
];

export default function TutorialCombatClient({
  user,
  targetMonster,
}: {
  user: any;
  targetMonster: MonsterLore;
}) {
  const router = useRouter();
  const [baseDb, setBaseDb] = useState(30);
  const [step, setStep] = useState(0);
  const [monsterHp, setMonsterHp] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);

  const {
    currentDb,
    peakDb,
    attackWord,
    isListening,
    startListening,
    stopListening,
    calculateDamageInfo,
  } = useVoiceCombat(user.classId || "commoner", baseDb);

  useEffect(() => {
    const savedBaseDb = localStorage.getItem("baseDb");
    if (savedBaseDb) {
      setBaseDb(parseInt(savedBaseDb, 10));
    }
  }, []);

  useEffect(() => {
    // Stage 2: Waiting for user to start listening and make a sound
    if (step === 2 && isListening && peakDb > baseDb + 5) {
      setStep(3); // Move to next dialogue
    }
  }, [isListening, peakDb, step, baseDb]);

  const handleNextDialogue = () => {
    if (TUTORIAL_SCRIPT[step].actionRequired === "NEXT") {
      setStep(step + 1);
    } else if (TUTORIAL_SCRIPT[step].actionRequired === "FINALIZE") {
      handleVictory();
    }
  };

  const handleAttack = () => {
    if (step !== 3) return;

    // Stop listening before calc
    stopListening();

    // Slight delay to allow state changes
    setTimeout(() => {
      const { damage, logs, matchedKeyword } = calculateDamageInfo(
        targetMonster.name,
      );

      setCombatLogs(logs);

      if (damage > 0 && matchedKeyword) {
        setLastHitTime(Date.now());
        setMonsterHp(0);
        setIsDead(true);
        setStep(4); // Move to final dialogues
      } else {
        alert(
          "마에스트로: 키워드가 틀렸거나 소리가 너무 작네! '소닉 펀치'라고 마무리 지어봐!",
        );
      }
    }, 100);
  };

  const handleVictory = async () => {
    try {
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expGain: 100 }),
      });
    } catch (e) {
      console.error(e);
    }
    alert("튜토리얼 완료! 이제 스테이지 중심으로 탐험하세요.");
    router.push("/map");
  };

  const currentScript = TUTORIAL_SCRIPT[step];

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--color-deep-navy)] font-sans select-none overflow-hidden relative">
      <div className="absolute inset-0 bg-[#0a0e1a] opacity-90 pointer-events-none" />

      {/* 0. Exit Tutorial Navigation */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            stopListening();
            router.push("/map");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-amber-500/40 rounded-xl mt-top-navigation text-amber-200/80 hover:text-amber-400 hover:bg-black/90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)] group">
          <span className="text-xl group-hover:-translate-x-1 transition-transform">
            🚪
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">
            훈련장 나가기
          </span>
        </button>
      </div>

      {/* 1. 상단: 몬스터 뷰 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 pt-16 md:pt-20">
        <h2 className="text-2xl font-bold text-amber-500 mb-2 tracking-widest text-glow-gold">
          {targetMonster.name}
        </h2>

        {/* 몬스터 체력바 */}
        <div className="w-full max-w-[16rem] bg-gray-900 border-2 border-amber-500/50 h-4 mb-6 md:mb-8 rounded shadow-[0_0_10px_rgba(245,166,35,0.3)]">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-400"
            animate={{ width: `${(monsterHp / 100) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 몬스터 스프라이트 */}
        <motion.div
          key={lastHitTime}
          initial={isDead ? { opacity: 0 } : { scale: 1 }}
          animate={
            isDead
              ? {
                  scale: 0,
                  opacity: 0,
                  rotate: 180,
                  transition: { duration: 1 },
                }
              : lastHitTime
                ? {
                    x: [-20, 20, -20, 20, 0],
                    filter: "brightness(2)",
                    transition: { duration: 0.4 },
                  }
                : {
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 2 },
                  }
          }
          className={`relative w-40 h-40 md:w-64 md:h-64 border-4 border-amber-500/50 bg-gray-900 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(245,166,35,0.4)] overflow-hidden`}>
          {!isDead && (
            <Image
              src={targetMonster.image}
              alt="scarecrow"
              fill
              className="object-cover"
              priority
              draggable={false}
            />
          )}
        </motion.div>
      </div>

      {/* 2. 시네마틱 NPC 대화창 오버레이 */}
      <AnimatePresence>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40 px-4">
          <div className="panel-fantasy p-6 rounded-2xl flex items-start gap-4 shadow-2xl border-amber-500/60 bg-black/80 backdrop-blur-md">
            <Image
              src="/maestro-npc.png"
              alt="Maestro"
              width={64}
              height={64}
              className="rounded-full border-2 border-amber-400"
            />
            <div className="flex-1">
              <h3 className="text-amber-400 font-bold text-lg mb-2">
                안내자 마에스트로
              </h3>
              <p className="text-gray-200 text-base leading-relaxed tracking-wide">
                "{currentScript.text}"
              </p>
              {currentScript.actionRequired === "NEXT" && (
                <button
                  onClick={handleNextDialogue}
                  className="mt-4 text-xs btn-gold px-4 py-1">
                  [SPACE] 계속 듣는다...
                </button>
              )}
              {currentScript.actionRequired === "FINALIZE" && (
                <button
                  onClick={handleNextDialogue}
                  className="mt-4 text-xs btn-gold px-4 py-1 shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                  운명의 여정을 시작한다
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 3. 하단 커맨드 패널 */}
      <div className="w-full panel-fantasy border-t-2 border-b-0 rounded-t-2xl md:rounded-t-3xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 relative z-20 mx-auto max-w-5xl overflow-y-auto max-h-[55svh]">
        {/* 좌측: 플레이어 상태 및 셔우트 미터 */}
        <div className="w-full md:w-1/2 bg-black/50 border border-amber-500/20 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="flex justify-between text-xs text-amber-200 font-bold mb-2 tracking-widest z-10">
            <span>PEAK RESONANCE</span>
            <span>
              {Math.round(peakDb)} dB (필요: {baseDb + 5})
            </span>
          </div>
          {/* 데시벨 바 */}
          <div className="w-full h-8 border-[3px] border-amber-500/50 rounded-full overflow-hidden relative bg-gray-900 z-10">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-red-500 transition-all duration-75"
              style={{
                width: `${Math.min(100, Math.max(0, ((currentDb - baseDb) / 70) * 100))}%`,
              }}
            />
          </div>
          {/* 실시간 텍스트 인식 현황 */}
          <div className="mt-4 flex-1 flex flex-col justify-end z-10">
            <span className="text-[10px] text-cyan-500/80 mb-1 tracking-widest uppercase font-bold">
              Lexical Engine [STT]
            </span>
            <div className="bg-[#0a0e1a]/80 border border-cyan-800 p-3 rounded font-bold text-center h-16 flex items-center justify-center">
              {attackWord ? (
                <span className="text-cyan-300 text-lg drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] leading-tight break-keep">
                  "{attackWord}"
                </span>
              ) : (
                <span className="text-gray-600 text-sm animate-pulse">
                  마이크에 대고 외치세요...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 튜토리얼 제한 커맨드 */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-3">
          {combatLogs.length > 0 && (
            <div className="text-xs text-amber-400 bg-black/50 p-2 rounded mb-2 border border-amber-900/50">
              {combatLogs[combatLogs.length - 1]}
            </div>
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            disabled={step < 2 || step >= 4}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg text-white
                ${
                  step < 2 || step >= 4
                    ? "bg-gray-800 opacity-50 cursor-not-allowed border border-gray-600"
                    : isListening
                      ? "bg-red-900/80 border border-red-500 hover:bg-red-800 animate-pulse"
                      : "bg-amber-900/80 border border-amber-500 hover:bg-amber-800 animate-bounce"
                }`}>
            {isListening ? "■ 기합 멈추기" : "▶ 기합 모으기"}
          </button>
          <button
            onClick={handleAttack}
            disabled={step !== 3 || !attackWord}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg text-white
                ${step !== 3 || !attackWord ? "bg-gray-800 opacity-50 cursor-not-allowed border border-gray-600" : "btn-crimson animate-pulse"}`}>
            ⚔️ 파음격 발동 (STT 판정)
          </button>
        </div>
      </div>
    </div>
  );
}
