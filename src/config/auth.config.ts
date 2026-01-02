import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/config/prisma"

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Nom et mot de passe requis");
                }

                const admin = await prisma.admin.findUnique({
                    where: { name: credentials.username },
                });

                if (!admin || !admin.password) {
                    throw new Error("Admin non trouvé ou mot de passe manquant");
                }

                const isValid = await compare(credentials.password, admin.password);
                if (!isValid) return null;

                return {
                    id: admin.id,
                    name: admin.name,
                    role: "ADMIN",
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
