import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // ⚡ Auth-Kick 버그 근본 해결: secret을 명시적으로 설정
  // 이 값이 없으면 NextAuth가 JWE 토큰을 복호화하지 못하여
  // 모든 Server Component의 getServerSession()이 null을 반환합니다.
  secret:
    process.env.NEXTAUTH_SECRET ||
    "loud-legend-secret-key-change-in-production-2024",
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "유저명", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (user && user.passwordHash === credentials.password) {
          return {
            id: user.id,
            name: user.username,
            nickname: user.nickname,
            classId: user.classId,
            level: user.level,
            exp: user.exp,
            currentQuest: user.currentQuest,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.nickname = user.nickname;
        token.classId = user.classId;
        token.level = user.level;
        token.exp = user.exp;
        token.currentQuest = user.currentQuest;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name;
        session.user.nickname = token.nickname as string;
        session.user.classId = token.classId as string | null;
        session.user.level = token.level as number;
        session.user.exp = token.exp as number;
        session.user.currentQuest = token.currentQuest as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
