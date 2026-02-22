"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DIALOGUE_PAGES = [
  {
    speaker: "???",
    text: "...",
    effect: "none",
  },
  {
    speaker: "마에스트로",
    text: "오... 오오...! 세상에... 이 파동은...!",
    effect: "shake",
  },
  {
    speaker: "마에스트로",
    text: "드디어... 예언이 말하던 그 순간인가! 백 년 동안 단 한 번도 이렇게 거대한 심장 고동 소리를 들어본 적이 없어!",
    effect: "shake_intense",
  },
  {
    speaker: "마에스트로",
    text: "듣고 있는가? 이 세상은 지금 '거대한 침묵(The Silence)'이라는 끔찍한 부패의 병에 걸려 있다네. 모든 생명의 노래와 목소리를 빼앗아가버린 어둠이지...",
    effect: "dim",
  },
  {
    speaker: "마에스트로",
    text: "하지만 자네라면... 당신의 그 목소리라면 소리를 무기로 바꾸는 기적을 행할 수 있을지도 몰라. 당신이야말로 전설로 내려오던 '마지막 메아리(The Last Echo)'다!",
    effect: "bright",
  },
  {
    speaker: "마에스트로",
    text: "서둘러야 해! 침묵의 군단이 자네의 빛나는 파동을 감지하고 몰려오기 시작했어. 나를 따라오게, 이 세상을 구원할 위대한 전사여!",
    effect: "urgency",
  },
];

export default function EpicIntroPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  const currentDialogue = DIALOGUE_PAGES[step];
  const isLast = step === DIALOGUE_PAGES.length - 1;

  // 타이핑 효과
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(currentDialogue.text.slice(0, i));
      i++;
      if (i > currentDialogue.text.length) {
        clearInterval(intervalId);
      }
    }, 40);
    return () => clearInterval(intervalId);
  }, [step]);

  const handleNext = () => {
    if (!isLast) {
      setStep((prev) => prev + 1);
    } else {
      router.push("/map");
    }
  };

  const getEffectClass = () => {
    switch (currentDialogue.effect) {
      case "shake":
        return "animate-pulse shadow-yellow-500/50";
      case "shake_intense":
        return "animate-bounce shadow-yellow-600/80";
      case "dim":
        return "bg-gray-900 border-purple-900 shadow-purple-900/50";
      case "bright":
        return "bg-white text-black border-yellow-400 shadow-yellow-400/90";
      case "urgency":
        return "animate-pulse border-red-600 shadow-red-600/90";
      default:
        return "border-gray-600 shadow-black/50";
    }
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-black overflow-hidden relative select-none px-4">
      {/* 백그라운드 효과 */}
      <motion.div
        animate={{
          backgroundColor:
            currentDialogue.effect === "dim"
              ? "#000"
              : currentDialogue.effect === "bright"
                ? "#2a2a00"
                : currentDialogue.effect === "urgency"
                  ? "#2a0000"
                  : "#111",
        }}
        className="absolute inset-0 transition-colors duration-1000"
      />

      <div className="z-10 w-full max-w-4xl p-6 flex flex-col items-center">
        {/* NPC 아바타 및 화면 흔들림 효과 애니메이션 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: currentDialogue.effect.includes("shake")
                ? [-5, 5, -5, 5, 0]
                : 0,
            }}
            transition={{ duration: 0.5 }}
            className={`w-40 h-40 rounded-full border-4 flex items-center justify-center text-6xl shadow-2xl mb-8 transition-colors ${currentDialogue.effect === "bright" ? "border-yellow-400 bg-yellow-100" : "border-gray-500 bg-gray-800"}`}>
            🪗
          </motion.div>
        </AnimatePresence>

        {/* 대화 상자 */}
        <motion.div
          className={`w-full p-8 rounded-xl border-2 shadow-2xl backdrop-blur-sm transition-all duration-500 min-h-[200px] flex flex-col justify-between ${getEffectClass()}`}
          onClick={handleNext}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}>
          <div>
            <h3
              className={`text-2xl font-bold mb-4 ${currentDialogue.effect === "bright" ? "text-yellow-600" : "text-yellow-500"}`}>
              {currentDialogue.speaker}
            </h3>
            <p
              className={`text-xl leading-relaxed ${currentDialogue.effect === "bright" ? "text-gray-900 font-bold" : "text-gray-200"}`}>
              {displayedText}
            </p>
          </div>

          <div
            className={`text-right mt-4 text-sm animate-pulse ${currentDialogue.effect === "bright" ? "text-gray-600" : "text-gray-500"}`}>
            클릭하여 계속...
          </div>
        </motion.div>
      </div>
    </div>
  );
}
