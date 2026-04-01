import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
  secret: process.env.AUTH_SECRET, // 显式指定（可选，v5通常会自动读取）
});
