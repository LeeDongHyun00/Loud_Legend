"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CalibrationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [baseDb, setBaseDb] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const [done, setDone] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);

  const startMeasure = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new window.AudioContext();
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

      // 5초간 측정 후 자동 종료
      setTimeout(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current)
          audioContextRef.current.close().catch(() => {});
        const samples = samplesRef.current;
        const avgDb = Math.round(
          samples.reduce((a, b) => a + b, 0) / (samples.length || 1),
        );
        setBaseDb(avgDb);
        setMeasuring(false);
        setDone(true);
      }, 5000);
    } catch (err) {
      alert("마이크 권한이 필요합니다!");
    }
  };

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("baseDb", baseDb.toString());

      // 첫 로그인 판별: 레벨 1에 경험치가 0이고 직업이 없는 경우 (새 전사)
      const user = session?.user;
      if (user && user.level === 1 && user.exp === 0 && !user.classId) {
        router.push("/intro");
      } else {
        router.push("/map");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white font-sans">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-yellow-500">🎙️ 소음 측정</h1>
        <p className="text-gray-400 text-center leading-relaxed">
          조용한 환경에서 <strong>5초간</strong> 가만히 있어주세요.
          <br />
          주변 환경 소음을 측정하여 전투 기준치를 설정합니다.
        </p>

        {/* 현재 데시벨 시각화 */}
        <div className="w-full h-8 bg-gray-800 rounded-full border border-gray-600 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-75 rounded-full"
            style={{ width: `${Math.min(100, baseDb)}%` }}
          />
        </div>
        <p className="text-2xl font-mono text-gray-300">
          {measuring
            ? `측정 중... ${baseDb}`
            : done
              ? `기준치: ${baseDb}`
              : "대기 중"}
        </p>

        {!measuring && !done && (
          <button
            onClick={startMeasure}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-bold text-xl rounded-xl transition-colors">
            측정 시작
          </button>
        )}

        {measuring && (
          <div className="text-yellow-400 animate-pulse text-lg font-bold">
            🔇 조용히 해주세요... 5초간 측정합니다
          </div>
        )}

        {done && (
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-green-600 hover:bg-green-500 font-bold text-xl rounded-xl transition-colors">
            측정 완료! 모험 시작하기 →
          </button>
        )}
      </div>
    </div>
  );
}
