import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TRIALS } from "@/lib/data/Trials";
import TrialClient from "./TrialClient";

export default async function TrialPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const trial = TRIALS.find((t) => t.id === params.id);

  if (!trial) {
    redirect("/trial");
  }

  // Double check level requirement
  const userLevel = session.user?.level || 1;
  if (userLevel < trial.requiredLevel) {
    redirect("/trial");
  }

  return <TrialClient user={session.user} trial={trial} />;
}
