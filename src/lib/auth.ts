import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { ensureSeeded, getStore } from "@/lib/store";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "farja-development-secret-please-change";

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn("[farja] NEXTAUTH_SECRET is not set — using an insecure development secret. Add it in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await ensureSeeded();
          const email = String(credentials?.email ?? "").trim().toLowerCase();
          const password = String(credentials?.password ?? "");
          if (!email || !password) return null;

          const store = await getStore();
          const user = await store.findUserByEmail(email);
          if (!user) return null;

          const valid = await compare(password, user.passwordHash);
          if (!valid) return null;

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
          console.error("[farja] Sign-in failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).id = user.id;
        (token as Record<string, unknown>).role = user.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String((token as Record<string, unknown>).id ?? token.sub ?? "");
        session.user.role = ((token as Record<string, unknown>).role as UserRole) ?? "USER";
      }
      return session;
    },
  },
});

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function currentUserRecord() {
  const user = await currentUser();
  if (!user?.id) return null;
  const store = await getStore();
  return store.findUserById(user.id);
}
