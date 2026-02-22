"use client";
import { User } from "next-auth";
import Image from "next/image";

export default function HUD({ user }: { user: any }) {
  const currentExp = user.exp || 0;
  const maxExp = user.level * 100;
  const expPercentage = Math.min(100, (currentExp / maxExp) * 100);

  // 직업별 초상화 배정
  let avatarIcon = "⚔️"; // 기본값
  let avatarColor = "bg-gray-700";
  if (user.classId === "berserker") {
    avatarIcon = "🪓";
    avatarColor = "bg-red-800";
  } else if (user.classId === "assassin") {
    avatarIcon = "🗡️";
    avatarColor = "bg-purple-900";
  } else if (user.classId === "mage") {
    avatarIcon = "🦯";
    avatarColor = "bg-blue-900";
  }

  return (
    <div className="w-full h-24 bg-gray-900 border-t-2 border-yellow-600 flex shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-50">
      {/* 1. 아바타 및 닉네임 박스 */}
      <div className="flex w-64 border-r border-gray-700 p-2 items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full border-2 border-yellow-400 flex justify-center items-center text-3xl shadow-lg ${avatarColor}`}>
          {avatarIcon}
        </div>
        <div className="flex flex-col">
          <span className="text-yellow-500 font-bold text-lg leading-none mb-1">
            Lv.{user.level} {user.nickname}
          </span>
          <span className="text-gray-400 text-xs">
            {user.classId ? user.classId.toUpperCase() : "NOVICE"}
          </span>
        </div>
      </div>

      {/* 2. 경험치 및 상태 게이지 영역 */}
      <div className="flex-1 flex flex-col justify-center px-8 border-r border-gray-700">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-bold text-gray-300">내공 (EXP)</span>
          <span className="text-xs text-gray-400">
            {currentExp} / {maxExp}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-500"
            style={{ width: `${expPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. 현재 퀘스트 및 설정 영역 */}
      <div className="w-64 p-3 flex flex-col justify-center relative bg-gray-950">
        <span className="text-xs text-yellow-600 font-bold mb-1">
          추적 중인 퀘스트
        </span>
        <p
          className="text-sm text-gray-300 truncate w-full"
          title={user.currentQuest}>
          {user.currentQuest}
        </p>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-800 rounded text-gray-400 transition-colors">
          ⚙️
        </button>
      </div>
    </div>
  );
}
