import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CombatClient from "./CombatClient";
import TutorialCombatClient from "./TutorialCombatClient";
import { MONSTERS } from "@/lib/data/Lore";

export default async function CombatPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const targetMonster = MONSTERS.find((m) => m.id === params.id);

  if (!targetMonster) {
    redirect("/map");
  }

  if (targetMonster.id === "scarecrow") {
    return <TutorialCombatClient user={user} targetMonster={targetMonster} />;
  }

  return <CombatClient user={user} targetMonster={targetMonster} />;
}
