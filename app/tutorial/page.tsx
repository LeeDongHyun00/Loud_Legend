import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MONSTERS } from "@/lib/data/Lore";
import TutorialClient from "./TutorialClient";

export default async function TutorialPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const scarecrow = MONSTERS.find((m) => m.id === "scarecrow") || MONSTERS[0];

  return (
    <TutorialClient
      scarecrow={scarecrow}
      nickname={session.user.nickname as string}
    />
  );
}
