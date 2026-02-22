"use client";
import LoreModal from "@/components/LoreModal";
import { MonsterLore } from "@/lib/data/Lore";

export default function TutorialClient({
  scarecrow,
  nickname,
}: {
  scarecrow: MonsterLore;
  nickname: string;
}) {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-gray-900 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] overflow-hidden w-full">
      <LoreModal monster={scarecrow} nickname={nickname} onClose={() => {}} />
    </div>
  );
}
