"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrialData } from "@/lib/data/Trials";
import { useVoiceCombat } from "@/hooks/useVoiceCombat";

export default function TrialClient({
  user,
  trial,
}: {
  user: any;
  trial: TrialData;
}) {
  const router = useRouter();
  const [baseDb, setBaseDb] = useState(30);

  // Trial States
  const [status, setStatus] = useState<
    "IDLE" | "PLAYING" | "SUCCESS" | "FAILED"
  >("IDLE");
  const [progress, setProgress] = useState(0); // 0 to 100
  const [timeLeft, setTimeLeft] = useState(trial.timeLimitSeconds || 60);
  const [isFailed, setIsFailed] = useState(false);

  // For SEQUENCE
  const [currentSeqIdx, setCurrentSeqIdx] = useState(0);

  const {
    currentDb,
    peakDb,
    attackWord,
    isListening,
    startListening,
    stopListening,
    setAttackWord,
  } = useVoiceCombat(user?.classId || "commoner", baseDb);

  useEffect(() => {
    const savedBaseDb = localStorage.getItem("baseDb");
    if (savedBaseDb) {
      setBaseDb(parseInt(savedBaseDb, 10));
    }
  }, []);

  // Timer logic for SEQUENCE and general timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "PLAYING") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFailure();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Main Trial Logic Loop
  useEffect(() => {
    if (status !== "PLAYING" || !isListening) return;

    if (trial.type === "SUSTAIN" && trial.targetDb && trial.durationSeconds) {
      // Logic for Sustain
      if (peakDb >= trial.targetDb) {
        // Increase progress roughly by 100 / (duration * 10) on a 100ms cycle
        setProgress((prev) => {
          const next = prev + 100 / (trial.durationSeconds! * 10);
          if (next >= 100) {
            handleSuccess();
            return 100;
          }
          return next;
        });
      } else {
        // Punish if dropped
        setProgress((prev) => Math.max(0, prev - 2));
      }
    } else if (trial.type === "ZENITH" && trial.targetDb) {
      // Logic for Zenith
      if (peakDb >= trial.targetDb) {
        setProgress(100);
        handleSuccess();
      } else {
        setProgress(Math.max(0, (peakDb / trial.targetDb) * 100));
      }
    } else if (trial.type === "SEQUENCE" && trial.sequence) {
      // Logic for Sequence keyword mapping
      if (attackWord) {
        const targetWord = trial.sequence[currentSeqIdx];
        if (attackWord.includes(targetWord)) {
          // Matched!
          const nextIdx = currentSeqIdx + 1;
          setCurrentSeqIdx(nextIdx);
          setProgress((nextIdx / trial.sequence.length) * 100);
          setAttackWord(""); // Clear STT

          if (nextIdx >= trial.sequence.length) {
            handleSuccess();
          }
        }
      }
    }
  }, [peakDb, attackWord, isListening, status]);

  const startTrial = () => {
    setStatus("PLAYING");
    setProgress(0);
    setCurrentSeqIdx(0);
    setTimeLeft(trial.timeLimitSeconds || (trial.type === "SUSTAIN" ? 30 : 60)); // Default fallback times
    startListening();
  };

  const handleFailure = () => {
    stopListening();
    setStatus("FAILED");
  };

  const handleSuccess = async () => {
    if (status === "SUCCESS") return; // Prevent double trigger
    stopListening();
    setStatus("SUCCESS");

    try {
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expGain: trial.rewardExp }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const leaveTrial = () => {
    stopListening();
    router.push("/trial");
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black font-sans select-none overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c101a] to-[#040608] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-40 pointer-events-none z-0 mix-blend-overlay" />

      {/* Decorative Cyber-Fantasy Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

      {/* Close Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={leaveTrial}
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500 transition-all flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          ✕
        </button>
      </div>

      {/* 1. Header Information */}
      <div className="relative z-10 p-8 flex flex-col items-center">
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-cyan-500 mb-2">
          {trial.type} Trial
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest text-glow-cyan drop-shadow-md text-center">
          {trial.name}
        </h1>
        <p className="text-sm text-slate-400 mt-4 max-w-xl text-center leading-relaxed">
          {trial.description}
        </p>
      </div>

      {/* 2. Main Trial Interface */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-3xl mx-auto px-6">
        {status === "IDLE" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center">
            <div className="w-48 h-48 rounded-full border-4 border-cyan-500/30 flex items-center justify-center mx-auto mb-8 bg-cyan-900/20 shadow-[0_0_50px_rgba(34,211,238,0.15)]">
              <span className="text-6xl animate-pulse">🎙️</span>
            </div>
            <button
              onClick={startTrial}
              className="px-12 py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl shadow-[0_0_30px_rgba(8,145,178,0.6)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all transform hover:-translate-y-1">
              시련의 문 열기
            </button>
          </motion.div>
        )}

        {status === "PLAYING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center">
            {/* Timer for SEQUENCE / Timeout */}
            <div className="text-4xl font-mono text-amber-400 font-bold mb-8 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <span>⏳</span> {timeLeft}s
            </div>

            {/* Trial Type Specific Visuals */}
            {trial.type === "SUSTAIN" || trial.type === "ZENITH" ? (
              <div className="w-full max-w-md flex flex-col items-center mb-10">
                <span className="text-xl text-white font-bold mb-2">
                  목표 DB:{" "}
                  <span className="text-cyan-400">{trial.targetDb}</span> /
                  현재: {Math.round(peakDb)}
                </span>

                {/* 360 Radial Progress or Horizontal Bar */}
                <div className="w-full h-8 bg-slate-900 rounded-full border-2 border-slate-700 overflow-hidden relative shadow-inner">
                  <motion.div
                    className={`absolute top-0 left-0 h-full ${peakDb >= (trial.targetDb || 0) ? "bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.8)]" : "bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.5)]"}`}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                  {trial.type === "SUSTAIN" && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/50 mix-blend-difference">
                      유지 진행도 (Sustain Progress)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full mb-10 text-center">
                <p className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-widest">
                  Target Sequence
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {trial.sequence?.map((word, idx) => {
                    const isPassed = idx < currentSeqIdx;
                    const isCurrent = idx === currentSeqIdx;
                    return (
                      <div
                        key={idx}
                        className={`px-6 py-3 rounded-xl border-2 font-black text-lg transition-all ${isPassed ? "bg-cyan-900/50 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]" : isCurrent ? "bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-110 relative z-10" : "bg-slate-900/50 border-slate-700 text-slate-500"}`}>
                        {word}
                      </div>
                    );
                  })}
                </div>

                {/* STT Input Feed */}
                <div className="mt-8 bg-slate-900/80 p-4 rounded-xl border border-slate-700 min-h-[80px] flex items-center justify-center">
                  {attackWord ? (
                    <span className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                      "{attackWord}"
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 font-bold animate-pulse">
                      마이크에 대고 외치십시오...
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setIsFailed(true);
                handleFailure();
              }}
              className="mt-8 px-8 py-3 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-300 font-bold border border-red-900 transition-colors">
              중도 포기
            </button>
          </motion.div>
        )}

        {/* FAILED STATE */}
        {status === "FAILED" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center bg-red-950/40 p-10 rounded-3xl border border-red-900/50 backdrop-blur-md">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-3xl font-black text-red-500 tracking-widest mb-4 text-glow-crimson">
              시련 실패
            </h2>
            <p className="text-slate-400 mb-8">
              집중력이 흩어졌거나 시간이 초과되었습니다.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={leaveTrial}
                className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold">
                뒤로가기
              </button>
              <button
                onClick={startTrial}
                className="px-6 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(185,28,28,0.5)]">
                다시 도전
              </button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {status === "SUCCESS" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center bg-cyan-950/40 p-10 rounded-3xl border border-cyan-800/50 backdrop-blur-md">
            <div className="text-6xl mb-4 text-glow-cyan animate-bounce">
              💎
            </div>
            <h2 className="text-3xl font-black text-cyan-400 tracking-widest mb-4">
              시련 극복
            </h2>
            <p className="text-slate-300 mb-2">
              당신의 메아리가 봉인을 깨뜨렸습니다!
            </p>
            <p className="text-amber-400 font-bold mb-8">
              + {trial.rewardExp} 공명 경험치 획득
            </p>
            <button
              onClick={leaveTrial}
              className="px-10 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black shadow-[0_0_20px_rgba(8,145,178,0.6)]">
              로비로 귀환
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
