"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 한글 수학 캡챠 생성 로직
const numToKorean = [
  "영",
  "일",
  "이",
  "삼",
  "사",
  "오",
  "육",
  "칠",
  "팔",
  "구",
];
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = (a + b).toString();
  const text = `${numToKorean[a]} 더하기 ${numToKorean[b]}은?`;
  return { answer, text };
}

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [error, setError] = useState("");

  const [isNicknameValid, setIsNicknameValid] = useState<boolean | null>(null);
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);

  // 닉네임 중복 실시간(디바운스) 검사
  useEffect(() => {
    if (nickname.trim().length === 0) {
      setIsNicknameValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-nickname", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname }),
        });
        const data = await res.json();
        setIsNicknameValid(data.isAvailable);
      } catch (err) {
        console.error(err);
      }
    }, 500); // 0.5초 디바운스

    return () => clearTimeout(timer);
  }, [nickname]);

  // 아이디 중복 실시간(디바운스) 검사
  useEffect(() => {
    if (username.trim().length === 0) {
      setIsUsernameValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        setIsUsernameValid(data.isAvailable);
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput !== captcha.answer) {
      setError("로봇이 아닙니까? 퀴즈 정답이 틀렸습니다.");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }
    if (isUsernameValid === false) {
      setError("중복된 아이디입니다. 변경해주세요.");
      return;
    }
    if (isNicknameValid === false) {
      setError("중복된 닉네임입니다. 변경해주세요.");
      return;
    }

    // 회원가입 API 호출
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, nickname }),
    });

    if (res.ok) {
      alert("전사 등록 완료! 로그인 해주세요.");
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSignup}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">전사 등록 (회원가입)</h2>
        {error && (
          <p className="text-red-500 text-sm font-bold bg-red-900/40 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="아이디"
            className={`p-2 rounded bg-gray-700 text-white border-2 transition-colors ${isUsernameValid === true ? "border-green-500" : isUsernameValid === false ? "border-red-500" : "border-transparent"}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <span className="text-xs min-h-[16px]">
            {isUsernameValid === true && (
              <span className="text-green-400">사용 가능한 아이디입니다!</span>
            )}
            {isUsernameValid === false && (
              <span className="text-red-400">이미 사용 중인 아이디입니다.</span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="인게임 닉네임 (지도와 전투에 표시됨)"
            className={`p-2 rounded bg-gray-700 text-white border-2 transition-colors ${isNicknameValid === true ? "border-green-500" : isNicknameValid === false ? "border-red-500" : "border-transparent"}`}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <span className="text-xs min-h-[16px]">
            {isNicknameValid === true && (
              <span className="text-green-400">
                사용 가능한 멋진 닉네임입니다!
              </span>
            )}
            {isNicknameValid === false && (
              <span className="text-red-400">
                이미 누군가 사용 중인 닉네임입니다.
              </span>
            )}
          </span>
        </div>

        <input
          type="password"
          placeholder="비밀번호"
          className="p-2 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="bg-gray-900 p-4 rounded mt-4 border border-gray-600">
          <p className="text-sm mb-2 text-yellow-500">
            [봇 방지 인증] 다음 퀴즈의 답을 숫자로 적어주세요.
          </p>
          <p className="font-bold text-lg mb-2">{captcha.text}</p>
          <input
            type="text"
            placeholder="숫자 정답 입력 (예: 5)"
            className="p-2 w-full rounded bg-gray-700 text-white"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={
            isNicknameValid === false ||
            isUsernameValid === false ||
            !nickname ||
            !username
          }
          className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold disabled:bg-gray-600 disabled:opacity-50 transition-all">
          가입 완료
        </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-sm text-gray-400 mt-2 hover:underline">
          로그인하러 가기
        </button>
      </form>
    </div>
  );
}
