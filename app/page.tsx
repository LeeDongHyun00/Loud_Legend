import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Loud Legend</h1>
      <p className="text-lg mb-8 text-center text-gray-300">
        목소리로 전투하는 새로운 형태의 RPG 게임입니다.
        <br />
        마이크 권한을 허용하고 게임을 시작하세요!
      </p>
      <Link
        href="/login"
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl transition-colors font-bold">
        게임 시작하기
      </Link>
    </main>
  );
}
