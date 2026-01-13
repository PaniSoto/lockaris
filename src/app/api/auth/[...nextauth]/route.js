import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) return null;

        // --- RETORNAMOS TODO EL OBJETO PARA EL TOKEN ---
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Si el usuario existe (momento del login), metemos su ID y Name en el JWT
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasamos los datos del JWT a la sesión de NextAuth
      if (session.user) {
        session.user.id = token.id; // <-- ESTO ES LO QUE ARREGLA EL ERROR 500
        session.user.name = token.name;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };