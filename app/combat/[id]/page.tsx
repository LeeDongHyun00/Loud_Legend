import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CombatClient from "./CombatClient";
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

  return (
    <CombatClient
      user={user}
      targetMonster={targetMonster}
      isTutorial={targetMonster.id === "scarecrow"}
    />
  );
}
