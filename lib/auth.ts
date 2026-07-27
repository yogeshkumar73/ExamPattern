import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { clientPromise } from "./mongodb"
import bcrypt from "bcryptjs"

// Dynamic admin authentication from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export const authOptions: any = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string || "user"
        session.user.isAdmin = token.email === ADMIN_EMAIL
      }
      return session
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role || "user"
      }
      return token
    },
  },
  events: {
    async signIn({ user, account }: { user: any; account: any }) {
      console.log(`[AUTH] User signed in: ${user.email} via ${account?.provider}`)
    },
  },
}

// Admin authentication helper
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) {
    console.warn("[AUTH] ADMIN_PASSWORD_HASH not configured")
    return false
  }
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH)
}

// Role-based access control
export function requireRole(role: string) {
  return (session: any) => {
    if (!session?.user) return false
    if (role === "admin" && session.user.email !== ADMIN_EMAIL) return false
    return true
  }
}
