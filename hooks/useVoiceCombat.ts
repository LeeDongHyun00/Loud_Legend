import { useState, useEffect, useRef } from "react";

export const NOVICE_KEYWORDS = [
  { word: "스매시", baseDmg: 20, desc: "기본적인 파음의 일격" },
  { word: "소닉 펀치", baseDmg: 30, desc: "소리에 물리력을 실어 타격" },
  { word: "에코 킥", baseDmg: 35, desc: "다리에 진동을 모아 차올림" },
  { word: "진동 가르기", baseDmg: 40, desc: "공명을 선형으로 응축시켜 벰" },
  { word: "파음격", baseDmg: 50, desc: "적의 갑각을 부수는 강력한 진동파" },
];

export const ULTIMATE_SKILLS = [
  {
    word: "공허의 메아리여 침묵을 찢고 창공을 부수어라",
    baseDmg: 300,
    reqDb: 80,
    desc: "엄청난 폐활량과 성량이 요구되는 1단계 금술",
  },
  {
    word: "심연에 잠든 파동이여 내 목소리에 응답하라",
    baseDmg: 500,
    reqDb: 85,
    desc: "절대 공명 2단계 제어 한계치를 넘은 파괴력",
  },
];

/**
 * Sonic Compression: Normalizes raw dB difference into a balanced value.
 * - Mobile devices get a 35% reduction (mic proximity compensation).
 * - Above 50 net dB, logarithmic diminishing returns kick in.
 */
function normalizeDb(rawNetDb: number): number {
  if (rawNetDb <= 0) return 0;

  // Detect mobile via touch capability
  const isMobile = typeof window !== "undefined" && "ontouchstart" in window;
  const scaleFactor = isMobile ? 0.65 : 1.0;
  const adjusted = rawNetDb * scaleFactor;

  // Logarithmic compression above threshold
  const threshold = 50;
  if (adjusted > threshold) {
    const excess = adjusted - threshold;
    return threshold + 20 * Math.log10(1 + excess);
  }

  return adjusted;
}

/**
 * Fuzzy match for Korean STT output.
 * Strips whitespace, punctuation, and common Korean particles (조사)
 * before checking if the spoken text contains the keyword.
 */
function fuzzyMatch(spokenText: string, keyword: string): boolean {
  // Strip all whitespace, punctuation, and common Korean particles
  const particlePattern = /[을를이가은는도에서의로와과만]$/;
  const clean = (s: string) =>
    s
      .replace(/[!?.\s]/g, "") // Remove punctuation & whitespace
      .replace(particlePattern, "") // Remove trailing Korean particles
      .toLowerCase();

  const cleanSpoken = clean(spokenText);
  const cleanKeyword = clean(keyword);

  // Primary: substring match
  if (cleanSpoken.includes(cleanKeyword)) return true;

  // Secondary: keyword includes spoken (for partial recognition)
  if (cleanKeyword.length > 3 && cleanKeyword.includes(cleanSpoken))
    return true;

  return false;
}

export function useVoiceCombat(classId: string, baseDb: number) {
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [attackWord, setAttackWord] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Audio & STT Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "ko-KR";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentWord = finalTranscript || interimTranscript;
        setAttackWord(currentWord.trim());
      };
    }

    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      if (isListening) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // iOS: Use webkitAudioContext fallback and resume after user gesture
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();

      // iOS autoplay policy: must resume AudioContext initiated by user gesture
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsListening(true);
      setPeakDb(0);
      setAttackWord("");

      const updateDb = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const mappedDb = Math.min(100, Math.max(0, average * 1.5));

        setCurrentDb(mappedDb);
        setPeakDb((prev) => Math.max(prev, mappedDb));

        animationFrameRef.current = requestAnimationFrame(updateDb);
      };

      updateDb();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } catch (err: any) {
      console.error("마이크 접근 권한 오류:", err);
      // Don't use alert() — let the calling component handle the error via isListening state
      if (err.name === "NotAllowedError") {
        console.warn(
          "마이크 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.",
        );
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCurrentDb(0);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (microphoneRef.current) {
      try {
        microphoneRef.current.disconnect();
      } catch (e) {}
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close().catch(console.error);
      } catch (e) {}
    }
  };

  const calculateDamageInfo = (targetName: string) => {
    const rawNetDb = Math.max(0, peakDb - baseDb);
    const netDb = normalizeDb(rawNetDb);

    const normalizedWord = attackWord.replace(/[!.?]/g, "").trim();
    let baseDamage = 0;
    let isUltimate = false;
    let matchedKeyword = "";
    const logs: string[] = [];

    if (!normalizedWord) {
      logs.push("키워드가 감지되지 않았습니다. 입을 열어 외치세요!");
      return { damage: 0, logs, matchedKeyword: "" };
    }

    // 1. Check Ultimate Skills
    const ultimate = ULTIMATE_SKILLS.find((u) =>
      fuzzyMatch(normalizedWord, u.word),
    );
    if (ultimate) {
      if (peakDb >= ultimate.reqDb) {
        baseDamage = ultimate.baseDmg;
        isUltimate = true;
        matchedKeyword = ultimate.word;
        logs.push(`[절대 공명] ${ultimate.word}!!`);
      } else {
        logs.push(
          `공명 파동이 얕습니다... (현재 최고 Peak dB: ${Math.round(peakDb)} / 요구치: ${ultimate.reqDb})`,
        );
        return { damage: 0, logs, matchedKeyword: "" };
      }
    } else {
      // 2. Check Novice Keywords (fuzzy match)
      const novice = NOVICE_KEYWORDS.find((n) =>
        fuzzyMatch(normalizedWord, n.word),
      );
      if (novice) {
        baseDamage = novice.baseDmg;
        matchedKeyword = novice.word;
        logs.push(`[액션 키워드 발동] ${novice.word}!`);
      } else {
        logs.push(
          `(올바른 액션 키워드를 외치지 않았습니다. 예: ...소닉 펀치!)`,
        );
        return { damage: 0, logs, matchedKeyword: "" };
      }
    }

    // Damage Formula: BaseDamage * (1 + netDb * 0.05)
    const multiplier = 1 + netDb * 0.05;
    let finalDamage = Math.floor(baseDamage * multiplier);

    // Class Adjustments
    if (classId === "berserker") {
      finalDamage = Math.floor(finalDamage * 1.2);
    } else if (classId === "mage" && isUltimate) {
      finalDamage = Math.floor(finalDamage * 1.5);
    } else if (classId === "assassin") {
      // Assassins need quiet prep, but loud blast. (A bit complex, keep it simple for now)
      finalDamage = Math.floor(finalDamage * 1.1);
    }

    if (finalDamage > 0) {
      logs.push(
        `=> ${targetName}에게 ${finalDamage}의 파음(破音) 피해를 입혔다! (Peak DB: ${Math.round(peakDb)})`,
      );
    }

    return { damage: finalDamage, logs, matchedKeyword, peakDb };
  };

  const calculateEchoDamage = () => {
    const rawNetDb = Math.max(0, peakDb - baseDb);
    const netDb = normalizeDb(rawNetDb);

    const finalDamage = Math.floor(netDb * 1.5);
    const logs: string[] = [];

    if (finalDamage > 0) {
      logs.push(`[메아리 타격] 공간의 진동이 적을 꿰뚫었다!`);
      logs.push(
        `=> ${finalDamage}의 원초적 메아리 피해를 입혔다! (Peak DB: ${Math.round(peakDb)})`,
      );
    } else {
      logs.push("공명 파동이 너무 얕아 피해를 주지 못했습니다.");
      return { damage: 0, logs, peakDb };
    }

    return { damage: finalDamage, logs, peakDb };
  };

  return {
    currentDb,
    peakDb,
    attackWord,
    isListening,
    startListening,
    stopListening,
    calculateDamageInfo,
    calculateEchoDamage,
    setAttackWord,
  };
}
