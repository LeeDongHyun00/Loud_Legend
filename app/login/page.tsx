"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("아이디 또는 비밀번호가 틀렸습니다.");
    } else {
      router.push("/map");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">로그인</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="아이디"
          className="p-2 rounded bg-gray-700 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="p-2 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold">
          접속하기
        </button>
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="text-sm text-gray-400 mt-2 hover:underline">
          전사 등록(회원가입) 하러 가기
        </button>
      </form>
    </div>
  );
}
