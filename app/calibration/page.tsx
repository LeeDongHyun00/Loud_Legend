"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMicrophone, MicPermissionStatus } from "@/hooks/useMicrophone";

export default function CalibrationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { permissionStatus, errorMessage, requestMic, releaseMic } =
    useMicrophone();

  const [baseDb, setBaseDb] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const [done, setDone] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);

  const startMeasure = async () => {
    // Use the useMicrophone hook for robust permission handling
    const stream = await requestMic();
    if (!stream) return; // Permission denied — UI will show error via hook state

    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();

      // iOS: Must resume AudioContext after user gesture
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setMeasuring(true);
      samplesRef.current = [];

      const measure = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = (sum / bufferLength) * 1.5;
        samplesRef.current.push(avg);
        setBaseDb(Math.round(avg));
        animFrameRef.current = requestAnimationFrame(measure);
      };
      measure();

      setTimeout(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current)
          audioContextRef.current.close().catch(() => {});
        releaseMic();
        const samples = samplesRef.current;
        const avgDb = Math.round(
          samples.reduce((a, b) => a + b, 0) / (samples.length || 1),
        );
        setBaseDb(avgDb);
        setMeasuring(false);
        setDone(true);
      }, 5000);
    } catch (err) {
      console.error("Calibration audio error:", err);
    }
  };

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("baseDb", baseDb.toString());
      const user = session?.user;
      if (user && user.level === 1 && user.exp === 0 && !user.classId) {
        router.push("/intro");
      } else {
        router.push("/map");
      }
    }
  };

  const getPermissionUI = () => {
    if (
      permissionStatus === "denied" ||
      permissionStatus === "blocked" ||
      permissionStatus === "not-secure" ||
      permissionStatus === "unsupported"
    ) {
      return (
        <div className="w-full bg-red-950/50 border border-red-800/50 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-red-300 text-sm font-bold text-center">
            ⚠️ {errorMessage}
          </p>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-amber-400 underline hover:text-amber-300 transition-colors mx-auto">
            마이크 권한 설정 방법 보기
          </button>
          {showHelp && (
            <div className="mt-2 text-xs text-slate-300 bg-slate-900 p-3 rounded-lg leading-relaxed space-y-1">
              <p className="font-bold text-amber-400 mb-1">
                📱 iOS (iPhone/iPad):
              </p>
              <p>설정 앱 → Safari (또는 Chrome) → 마이크 → 이 사이트 허용</p>
              <p className="font-bold text-amber-400 mb-1 mt-2">🤖 Android:</p>
              <p>
                Chrome → 주소 표시줄 왼쪽 🔒 아이콘 → 사이트 설정 → 마이크 →
                허용
              </p>
              <p className="font-bold text-amber-400 mb-1 mt-2">💻 데스크탑:</p>
              <p>주소 표시줄 왼쪽 🔒 아이콘 → 마이크 → 허용 → 새로고침</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-gray-950 text-white font-sans px-4 py-8">
      <div className="w-full max-w-md p-6 md:p-8 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center gap-5">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-500 text-center">
          🎙️ 소음 측정
        </h1>
        <p className="text-gray-400 text-center text-sm leading-relaxed">
          조용한 환경에서 <strong>5초간</strong> 가만히 있어주세요.
          <br />
          주변 환경 소음을 측정하여 전투 기준치를 설정합니다.
        </p>

        {/* Permission Error UI */}
        {getPermissionUI()}

        {/* DB Visualizer */}
        <div className="w-full h-8 bg-gray-800 rounded-full border border-gray-600 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-75 rounded-full"
            style={{ width: `${Math.min(100, baseDb)}%` }}
          />
        </div>
        <p className="text-xl font-mono text-gray-300">
          {measuring
            ? `측정 중... ${baseDb}`
            : done
              ? `기준치: ${baseDb}`
              : "대기 중"}
        </p>

        {!measuring && !done && (
          <button
            onClick={startMeasure}
            className="w-full min-h-[48px] py-4 bg-blue-600 hover:bg-blue-500 font-bold text-lg rounded-xl transition-colors">
            측정 시작
          </button>
        )}

        {measuring && (
          <div className="text-yellow-400 animate-pulse text-base font-bold text-center">
            🔇 조용히 해주세요... 5초간 측정합니다
          </div>
        )}

        {done && (
          <button
            onClick={handleContinue}
            className="w-full min-h-[48px] py-4 bg-green-600 hover:bg-green-500 font-bold text-lg rounded-xl transition-colors">
            측정 완료! 모험 시작하기 →
          </button>
        )}
      </div>
    </div>
  );
}
