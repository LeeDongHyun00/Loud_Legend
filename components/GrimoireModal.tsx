"use client";
import { motion } from "framer-motion";
import { NOVICE_KEYWORDS, ULTIMATE_SKILLS } from "@/hooks/useVoiceCombat";

export default function GrimoireModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(12px)",
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="relative w-full max-w-4xl h-[85vh] md:h-[80vh] bg-[#0c101a] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.15)] flex flex-col overflow-hidden">
        {/* Header Options */}
        <div className="flex justify-between items-center p-6 border-b border-amber-500/20 bg-black/40 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-amber-500 tracking-widest text-glow-gold flex items-center gap-3">
              <span className="text-3xl">📖</span>
              메아리의 마도서
            </h2>
            <p className="text-xs text-amber-200/60 uppercase tracking-[0.2em] mt-1 font-bold">
              Grimoire of Echoes - Attack Compendium
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-900/40 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/30">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative z-10">
          {/* Section 1: Meira Echo */}
          <section>
            <h3 className="text-lg font-bold text-cyan-400 border-b border-cyan-900 pb-2 mb-4 tracking-wider flex items-center gap-2">
              <span className="w-2 h-6 bg-cyan-500 rounded-sm"></span>
              원초적 공명 (Meira Echo Sequence)
            </h3>
            <div className="bg-cyan-950/30 border border-cyan-800/50 p-5 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center group hover:bg-cyan-900/40 transition-colors">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(192,38,211,0.5)] shrink-0">
                🔊
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1 group-hover:text-fuchsia-300 transition-colors">
                  메이라 타격 (Echo Strike)
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed break-keep">
                  언어의 형태를 빌리지 않고, 오직 성대에서 뿜어져 나오는{" "}
                  <strong className="text-purple-400">순수한 진동(dB)</strong>
                  만으로 공간을 타격합니다. 발음이 부정확해도 높은 성량만 있다면
                  즉각적이고 확정적인 피해를 입힐 수 있습니다.
                </p>
                <div className="mt-3 flex gap-3">
                  <span className="text-xs px-2 py-1 bg-black/50 rounded text-gray-500 font-bold border border-gray-800">
                    요구 키워드: 없음
                  </span>
                  <span className="text-xs px-2 py-1 bg-fuchsia-900/30 rounded text-fuchsia-400 font-bold border border-fuchsia-800">
                    피해량: 성량 절대치 비례 (1.5배수)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Novice Action Suffixes */}
          <section>
            <h3 className="text-lg font-bold text-amber-400 border-b border-amber-900 pb-2 mb-4 tracking-wider flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded-sm"></span>
              액션 키워드 (Action Suffixes)
            </h3>
            <p className="text-sm text-gray-500 mb-4 font-bold">
              문장의 끝에 아래 키워드를 붙여 마법 발현을 선언하십시오. (예:
              "받아라, <span className="text-amber-200">소닉 펀치!</span>")
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NOVICE_KEYWORDS.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl hover:border-amber-400/50 transition-colors flex justify-between items-center group">
                  <div>
                    <h4 className="text-amber-300 font-bold text-lg mb-1">
                      {skill.word}
                    </h4>
                    <p className="text-xs text-gray-400">{skill.desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="block text-[10px] text-amber-500/70 font-bold uppercase tracking-wider">
                      Base Dmg
                    </span>
                    <span className="text-xl font-black text-amber-500 font-mono group-hover:text-amber-300 transition-colors">
                      {skill.baseDmg}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Ultimate Skills */}
          <section>
            <h3 className="text-lg font-bold text-red-500 border-b border-red-900 pb-2 mb-4 tracking-wider flex items-center gap-2">
              <span className="w-2 h-6 bg-red-600 rounded-sm"></span>
              절대 공명 (Zenith Cries)
            </h3>
            <p className="text-sm text-gray-500 mb-4 font-bold">
              어떠한 수식어 없이 지정된 긴 문장을 정확히 영창해야 발동되는
              대마법입니다. 엄청난 성량을 필요로 합니다.
            </p>
            <div className="space-y-4">
              {ULTIMATE_SKILLS.map((ult, idx) => (
                <div
                  key={idx}
                  className="bg-red-950/20 border border-red-900/50 p-5 rounded-xl hover:bg-red-900/20 transition-colors relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    <h4 className="text-red-400 font-black text-xl mb-1 italic tracking-wide group-hover:text-red-300 transition-colors">
                      "{ult.word}"
                    </h4>
                    <p className="text-sm text-gray-400 mb-3">{ult.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 bg-black/50 rounded text-red-500 font-bold border border-red-900/50 flex items-center gap-1 shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        최소 요구치: {ult.reqDb} dB
                      </span>
                      <span className="text-xs px-2 py-1 bg-red-900/40 rounded text-red-200 font-bold border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        기본 파괴력: {ult.baseDmg}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Ambient background styling */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      </motion.div>
    </motion.div>
  );
}
