import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다." },
        { status: 401 },
      );
    }

    const { expGain } = await req.json();

    if (!expGain || typeof expGain !== "number") {
      return NextResponse.json(
        { message: "잘못된 경험치 수치입니다." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "유저를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    let newExp = user.exp + expGain;
    let newLevel = user.level;
    const requiredExpForNextLevel = newLevel * 100;

    // 단순 레벨업 로직 반영
    if (newExp >= requiredExpForNextLevel) {
      newLevel += 1;
      newExp -= requiredExpForNextLevel; // 초과분 이월
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        exp: newExp,
        level: newLevel,
      },
    });

    return NextResponse.json(
      {
        message: "경험치 획득 성공",
        level: updatedUser.level,
        exp: updatedUser.exp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Save state error:", error);
    return NextResponse.json({ message: "서버 오류", error }, { status: 500 });
  }
}
