import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
              return {
                id: (profile as any).sub,
                name: (profile as any).name,
                email: ((profile as any).email || "").toLowerCase(),
                image: (profile as any).picture,
              }
            },
          }),
        ]
      : []),
  ],
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      const email = typeof token.email === "string" ? token.email.toLowerCase() : null;
      if (user) {
        token.name = user.name || token.name
        token.email = (user.email || token.email || "")?.toLowerCase()
        // next-auth expects `token.picture`
        token.picture = (user as any)?.image || (user as any)?.picture || (token as any)?.picture
      }
      if (!email && typeof token.email === "string") {
        // continue
      } else if (!email) {
        return token
      }
      try {
        const appUser = await prisma.appUser.findUnique({ where: { email: (token.email as string).toLowerCase() } });
        (token as any).role = appUser?.role ?? "PUBLIC";
      } catch (err) {
        console.error("[auth] role lookup failed", err);
        (token as any).role = "PUBLIC";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
        const picture = (token as any)?.picture ?? (token as any)?.image
        if (typeof picture === "string" && picture.length > 0) {
          (session.user as any).image = picture
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
