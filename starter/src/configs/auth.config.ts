import type { NextAuthConfig } from 'next-auth'
import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import type { SignInCredential } from '@/@types/auth'

export default {
    providers: [
        Github({
            clientId: process.env.GITHUB_AUTH_CLIENT_ID,
            clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const user = await validateCredential(
                    credentials as SignInCredential,
                )

                if (!user) return null

                return {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    image: user.avatar,
                    role: user.role,
                    companyId: user.companyId,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.companyId = user.companyId
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                    role: token.role,
                    companyId: token.companyId,
                    authority: [token.role?.toLowerCase() ?? 'user'],
                },
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            }
        },
    },
} satisfies NextAuthConfig
