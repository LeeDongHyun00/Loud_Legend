import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname?: string;
      classId?: string | null;
      level?: number;
      exp?: number;
      currentQuest?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nickname?: string;
    classId?: string | null;
    level?: number;
    exp?: number;
    currentQuest?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname?: string;
    classId?: string | null;
    level?: number;
    exp?: number;
    currentQuest?: string;
  }
}
