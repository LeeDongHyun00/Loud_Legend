import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

    const { userId, classId } = await req.json();

    if (!userId || !classId) {
      return NextResponse.json(
        { message: "직업 정보가 누락되었습니다." },
        { status: 400 },
      );
    }

    const validClasses = ["berserker", "assassin", "mage"];
    if (!validClasses.includes(classId)) {
      return NextResponse.json(
        { message: "유효하지 않은 직업입니다." },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { classId },
    });

    return NextResponse.json(
      { message: "직업 선택 완료", classId: updatedUser.classId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Class selection error:", error);
    return NextResponse.json({ message: "서버 오류", error }, { status: 500 });
  }
}
