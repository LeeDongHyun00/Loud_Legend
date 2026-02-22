import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { TRIALS } from "@/lib/data/Trials";

export default async function TrialHubPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userLevel = session.user?.level || 1;

  return (
    <main className="min-h-screen bg-black font-sans text-white p-8 relative overflow-hidden flex flex-col items-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-indigo-950 to-black pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="z-10 text-center mt-12 mb-16 px-4">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-4">
          목소리의 시련
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-bold">
          "거대한 침묵을 깨고 세상의 이치를 뒤흔들 메아리를 증명하라."
        </p>
      </div>

      {/* Navigation to MAP */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/map"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 hover:scale-105 transition-all group">
          <span className="text-xl group-hover:-translate-x-1 transition-transform">
            ◀
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">
            지도 복귀
          </span>
        </Link>
      </div>

      {/* Trial List */}
      <div className="z-10 w-full max-w-4xl flex flex-col gap-6">
        {TRIALS.map((trial) => {
          const isLocked = userLevel < trial.requiredLevel;

          return (
            <div
              key={trial.id}
              className={`relative overflow-hidden rounded-2xl border ${isLocked ? "border-slate-800 bg-slate-900/40" : "border-cyan-500/30 bg-slate-900/80 hover:bg-slate-800 hover:border-cyan-400 group cursor-pointer transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"}`}>
              {/* Card Inner */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase ${isLocked ? "bg-slate-800 text-slate-500" : "bg-cyan-950 text-cyan-400 border border-cyan-800"}`}>
                      {trial.type}
                    </span>
                    {!isLocked && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase bg-amber-950 text-amber-500 border border-amber-800">
                        EXP {trial.rewardExp}
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-xl md:text-2xl font-black mb-2 ${isLocked ? "text-slate-600" : "text-white group-hover:text-cyan-300 transition-colors"}`}>
                    {trial.name}
                  </h3>
                  <p
                    className={`text-sm md:text-base font-medium ${isLocked ? "text-slate-700" : "text-slate-400"}`}>
                    {trial.description}
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                  {isLocked ? (
                    <div className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
                      <span>🔒</span>
                      <span className="text-xs font-bold text-slate-400">
                        요구 레벨: {trial.requiredLevel}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/trial/${trial.id}`}
                      className="block w-full text-center px-8 py-4 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all">
                      도전 시작 ⚔️
                    </Link>
                  )}
                </div>
              </div>

              {/* Decorative Accent */}
              {!isLocked && (
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
