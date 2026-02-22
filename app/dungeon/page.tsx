"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const stages = [
  {
    langCode: "ko-KR",
    title: "초급 발음 던전 (한국어)",
    targetSentence:
      "간장공장공장장은 강공장장이고 된장공장공장장은 공공장장이다",
    skillUnlock: "초강력",
    desc: "기본 데미지 1.5배 상승",
  },
  {
    langCode: "en-US",
    title: "고급 발음 던전 (영어)",
    targetSentence: "She sells seashells by the seashore",
    skillUnlock: "치명적인",
    desc: "데미지 배율 3배 (광전사, 암살자 특화)",
  },
];

export default function PronunciationDungeon() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [statusMsg, setStatusMsg] = useState(
    "마이크 권한을 허용하고 문장을 읽어주세요.",
  );
  const [completed, setCompleted] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Stage 변경 시 언어 새로 할당
    startRecording(stages[currentStage].langCode);
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [currentStage]);

  const startRecording = (lang: string) => {
    if (recognitionRef.current) recognitionRef.current.stop();

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = lang;
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          const cleanedText = finalTrans
            .trim()
            .toLowerCase()
            .replace(/[.,]/g, "");
          const targetCleaned = stages[currentStage].targetSentence
            .toLowerCase()
            .replace(/[.,]/g, "");
          setTranscript(cleanedText);

          // 띄어쓰기 무시하고 단순 글자 포함 여부나 일치율 정도 체크
          // 엄격하게 하려면 === 사용
          if (
            cleanedText.replace(/\s/g, "") === targetCleaned.replace(/\s/g, "")
          ) {
            setStatusMsg("발음이 정확합니다! 던전 클리어!");
            setCompleted(true);
            recognitionRef.current.stop();
          } else {
            setStatusMsg("발음이 부정확합니다. 다시 시도하세요.");
          }
        }
      };

      recognitionRef.current.start();
    }
  };

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
      setCompleted(false);
      setTranscript("");
      setStatusMsg("준비 완료! 다음 문장을 읽어주세요.");
    } else {
      alert("모든 스킬을 해금했습니다! 전투 아레나로 복귀합니다.");
      router.push("/game");
    }
  };

  const stage = stages[currentStage];

  return (
    <div className="flex h-screen bg-black text-white p-8 justify-center items-center">
      <div className="w-full max-w-2xl bg-gray-900 border border-purple-500 rounded-xl p-8 flex flex-col items-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
        <h1 className="text-3xl font-bold mb-2 text-purple-400">
          발음의 시련 (던전)
        </h1>
        <h2 className="text-xl mb-8 text-gray-400">{stage.title}</h2>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 w-full mb-6">
          <p className="text-sm text-yellow-500 mb-2 font-bold">
            도전 목표 문장:
          </p>
          <p className="text-2xl font-bold leading-relaxed">
            {stage.targetSentence}
          </p>
        </div>

        <div className="w-full flex flex-col min-h-24">
          <p className="text-sm text-blue-400 mb-2 font-bold">
            내 발음 인식 결과:
          </p>
          <div className="flex-1 p-4 bg-black rounded border border-gray-800 italic text-xl">
            {transcript || "..."}
          </div>
        </div>

        <p
          className={`mt-6 font-bold text-lg ${completed ? "text-green-500" : "text-red-400"}`}>
          {statusMsg}
        </p>

        {completed && (
          <div className="mt-8 border-t border-gray-700 pt-6 w-full flex flex-col items-center">
            <h3 className="text-green-400 font-bold mb-2 text-lg">
              🎉 새로운 스킬 해금!
            </h3>
            <p className="text-xl font-bold">[{stage.skillUnlock}]</p>
            <p className="text-gray-400 mb-6">{stage.desc}</p>

            <button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-purple-500/50 transition-all">
              다임 단계로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
