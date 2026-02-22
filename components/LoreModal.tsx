"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonsterLore } from "@/lib/data/Lore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoreModal({
  monster,
  onClose,
  nickname,
}: {
  monster: MonsterLore;
  onClose: () => void;
  nickname: string;
}) {
  const router = useRouter();
  const [dialogueStep, setDialogueStep] = useState(0);

  const totalLines = monster.backstory.length;
  const isFinished = dialogueStep >= totalLines;

  const handleNext = () => {
    if (!isFinished) {
      setDialogueStep((prev) => prev + 1);
    }
  };

  const handleStartCombat = () => {
    if (monster.id === "dungeon_1") {
      router.push("/dungeon");
    } else {
      router.push(`/combat/${monster.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        backgroundColor: `rgba(0, 0, 0, ${0.4 + (dialogueStep / totalLines) * 0.5})`,
        backdropFilter: `blur(${4 + (dialogueStep / totalLines) * 8}px)`,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700">
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="relative w-full max-w-3xl panel-fantasy overflow-hidden flex flex-col md:flex-row">
        {/* 왼쪽: NPC + 몬스터 비주얼 */}
        <div className="w-full md:w-2/5 bg-gradient-to-b from-gray-900 to-[var(--color-deep-navy)] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-amber-500/20 gap-4">
          {/* 몬스터 이미지 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-36 h-36 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,166,35,0.2)]">
            <Image
              src={monster.image}
              alt={monster.name}
              width={144}
              height={144}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* NPC 마에스트로 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/50">
              <Image
                src="/maestro-npc.png"
                alt="마에스트로"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400">마에스트로</h3>
              <p className="text-[10px] text-gray-500 tracking-wider">안내자</p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 대화창 */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between min-h-[300px]">
          {/* 헤더 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-bold tracking-wider uppercase">
                {monster.biome}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">
                Lv.{monster.requiredLevel}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white text-glow-gold">
              {monster.name}
            </h2>
          </div>

          {/* 대사 영역 */}
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-amber-500/10 min-h-[120px] relative flex items-center">
            <AnimatePresence mode="wait">
              {!isFinished ? (
                <motion.p
                  key={dialogueStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="text-base text-gray-200 leading-relaxed">
                  {monster.backstory[dialogueStep].replace(
                    "[닉네임]",
                    nickname,
                  )}
                </motion.p>
              ) : (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center w-full">
                  <p className="text-lg font-bold text-red-400 text-glow-crimson leading-relaxed">
                    &ldquo;{monster.callToAction}&rdquo;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 진행도 */}
            {!isFinished && (
              <div className="absolute bottom-2 right-3 flex gap-1">
                {Array.from({ length: totalLines }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === dialogueStep ? "bg-amber-400" : i < dialogueStep ? "bg-amber-600" : "bg-gray-700"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 버튼 프레임 */}
          <div className="flex justify-end gap-3 mt-5">
            {monster.id !== "scarecrow" && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-sm">
                도망가기
              </button>
            )}

            {!isFinished ? (
              <button
                onClick={handleNext}
                className="btn-gold flex items-center gap-2 text-sm">
                다음 이야기 <span>💬</span>
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={handleStartCombat}
                className="btn-crimson flex items-center gap-2 text-sm">
                전투 시작 <span>⚔️</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
