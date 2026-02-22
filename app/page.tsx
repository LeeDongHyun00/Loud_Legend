import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-12 text-center bg-gradient-to-b from-[#0a0e1a] via-[#111827] to-black relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Logo Section — Centered */}
      <div className="relative z-10 flex flex-col items-center gap-6 mb-10">
        <div className="text-6xl md:text-7xl drop-shadow-[0_0_30px_rgba(245,166,35,0.5)]">
          🔊
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 tracking-widest text-glow-gold">
          Loud Legend
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-sm leading-relaxed font-medium">
          목소리로 전투하는 새로운 형태의 RPG 게임입니다.
          <br />
          마이크 권한을 허용하고 게임을 시작하세요!
        </p>
      </div>

      {/* Mic Permission Hint */}
      <div className="relative z-10 mb-8 px-4 py-3 bg-amber-950/40 border border-amber-800/50 rounded-xl max-w-sm">
        <p className="text-xs text-amber-300/80 flex items-center gap-2">
          <span className="text-lg">🎙️</span>이 게임은{" "}
          <strong>마이크 권한</strong>이 필요합니다.
          <br className="md:hidden" />
          브라우저의 권한 요청을 반드시 &quot;허용&quot;해주세요.
        </p>
      </div>

      {/* CTA Button — Large Touch Target */}
      <Link
        href="/login"
        className="relative z-10 inline-flex items-center justify-center min-h-[48px] min-w-[200px] px-10 py-4 btn-crimson text-xl rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.7)] transition-all">
        게임 시작하기
      </Link>
    </main>
  );
}
