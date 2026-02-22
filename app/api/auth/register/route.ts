import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password, nickname } = await req.json();

    if (!username || !password || !nickname) {
      return NextResponse.json(
        { message: "기입되지 않은 정보가 있습니다." },
        { status: 400 },
      );
    }

    // 아이디 (username) 및 닉네임 중복 체크 (DB 에러 방어)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { nickname }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "이미 사용 중인 아이디입니다." },
          { status: 409 },
        );
      }
      if (existingUser.nickname === nickname) {
        return NextResponse.json(
          { message: "이미 사용 중인 닉네임입니다." },
          { status: 409 },
        );
      }
    }

    // 보안상 bcrypted password 필요하지만 프로토타입 위해 그냥 저장
    const newUser = await prisma.user.create({
      data: {
        username,
        nickname,
        passwordHash: password,
      },
    });

    return NextResponse.json(
      { message: "가입 성공", user: newUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/auth/register Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
