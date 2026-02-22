import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nickname } = await req.json();

    if (!nickname) {
      return NextResponse.json(
        { message: "닉네임을 입력해주세요." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      return NextResponse.json({ isAvailable: false }, { status: 200 });
    }

    return NextResponse.json({ isAvailable: true }, { status: 200 });
  } catch (error) {
    console.error("Check nickname error:", error);
    return NextResponse.json({ message: "서버 오류", error }, { status: 500 });
  }
}
