"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("아이디 또는 비밀번호가 틀렸습니다.");
    } else {
      router.push("/calibration");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-4 py-8">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2 text-center">로그인</h2>
        {error && (
          <p className="text-red-500 text-sm font-bold bg-red-900/30 p-2 rounded text-center">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="아이디"
          className="p-3 min-h-[44px] rounded-lg bg-gray-700 text-white text-base"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="p-3 min-h-[44px] rounded-lg bg-gray-700 text-white text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 min-h-[48px] bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-base disabled:opacity-50 transition-colors">
          {loading ? "접속 중..." : "접속하기"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="min-h-[44px] text-sm text-gray-400 mt-1 hover:underline hover:text-gray-200 transition-colors">
          전사 등록(회원가입) 하러 가기
        </button>
      </form>
    </div>
  );
}
