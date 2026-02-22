"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const classes = [
  {
    id: "berserker",
    name: "광전사",
    theme: "물리 / 폭발력",
    desc: "엄청난 폐활량과 목청으로 적을 박살냅니다.",
    maestro:
      "광전사의 길! 좋아, 피가 끓어오르는군. 복잡하게 생각할 필요 없어. 마이크가 터지도록 크게 소리쳐! 분노를 담아 크게 외칠수록, 네 망치는 적을 더 잔인하게 으깰 것이다!",
  },
  {
    id: "assassin",
    name: "암살자",
    theme: "은신 / 치명타",
    desc: "그림자 속에서 아주 작은 속삭임으로 급소를 노립니다.",
    maestro:
      "호오... 암살자의 길을 걷겠다고? 그림자 속에서는 숨소리조차 들려선 안 돼. 아주 작게, 속삭이듯 말해봐. 목청을 높였다간 네 위치만 적에게 들킬 뿐이야. 고요함이 네 칼날이다.",
  },
  {
    id: "mage",
    name: "마법사",
    theme: "고유 마법 주문 영창",
    desc: "정확한 혀놀림으로 마도서의 기괴한 주문을 완성합니다.",
    maestro:
      "마법사라... 현명한 선택이야. 고대 마도서의 언어는 인간의 언어와 구별되지. 네 혓바닥이 마력을 기억해야 한다. '크로바투스!' 정확한 주문만이 기적을 부른다는 걸 명심해.",
  },
];

export default function ClassSelectionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedClass, setSelectedClass] = useState<
    (typeof classes)[0] | null
  >(null);

  const handleSelect = async () => {
    if (!selectedClass || !session?.user?.id) return;

    const res = await fetch("/api/user/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        classId: selectedClass.id,
      }),
    });

    if (res.ok) {
      router.push("/map");
    } else {
      alert("직업 선택에 실패했습니다.");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white p-8 font-sans">
      {/* 마에스트로 대화 영역 */}
      <div className="w-1/3 flex flex-col justify-center items-center border-r border-gray-700 pr-8">
        <div className="w-32 h-32 rounded-full bg-blue-900 border-4 border-blue-400 mb-6 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          ✨
        </div>
        <h2 className="text-2xl font-bold text-blue-400 mb-4">마에스트로</h2>
        <div className="bg-gray-800 p-6 rounded-lg text-lg leading-relaxed relative border border-gray-600">
          <div className="absolute top-1/2 -right-3 w-4 h-4 bg-gray-800 border-t border-r border-gray-600 transform rotate-45 -translate-y-1/2"></div>
          {selectedClass ? (
            <p className="whitespace-pre-wrap">{selectedClass.maestro}</p>
          ) : (
            <p>
              "침묵의 세계에 온 걸 환영해! 나는 완벽한 음정의 가이드,
              '마에스트로'야.
              <br />
              <br />
              이곳에서 너의 목소리는 곧 무기지. 너의 길을 선택해봐!"
            </p>
          )}
        </div>
      </div>

      {/* 클래스 선택 영역 */}
      <div className="w-2/3 pl-8 flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-8">당신의 직업을 선택하세요</h1>
        <div className="flex flex-col gap-6 mb-10">
          {classes.map((cls) => (
            <button
              key={cls.id}
              className={`p-6 rounded-xl border-2 text-left transition-all ${selectedClass?.id === cls.id ? "border-red-500 bg-red-900/30" : "border-gray-700 bg-gray-900 hover:border-gray-500"}`}
              onMouseEnter={() => setSelectedClass(cls)}
              onClick={() => setSelectedClass(cls)}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold">{cls.name}</h3>
                <span className="text-gray-400 bg-black px-3 py-1 rounded text-sm">
                  {cls.theme}
                </span>
              </div>
              <p className="text-gray-300">{cls.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleSelect}
          disabled={!selectedClass}
          className="py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold text-xl rounded-lg transition-colors">
          {selectedClass
            ? `${selectedClass.name}의 길을 걷는다`
            : "직업을 선택해주세요"}
        </button>
      </div>
    </div>
  );
}
