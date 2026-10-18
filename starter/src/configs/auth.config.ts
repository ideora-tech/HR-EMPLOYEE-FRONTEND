import type { NextAuthConfig } from 'next-auth'
import { isJwtExpired } from '@/utils/jwtExpiry'
import validateCredential from '../server/actions/user/validateCredential'
import { fetchProfilSesi } from '../server/actions/user/fetchProfilSesi'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import type { SignInCredential } from '@/@types/auth'

/** Izin di sesi diperbarui dari backend paling lama tiap 5 menit. */
const IZIN_SEGAR_MS = 5 * 60 * 1000

export default {
    // Wajib untuk production self-hosted (Docker/di belakang Nginx) —
    // tanpa ini NextAuth menolak request dengan error UntrustedHost
    trustHost: true,
    providers: [
        ...(process.env.GITHUB_AUTH_CLIENT_ID && process.env.GITHUB_AUTH_CLIENT_SECRET
            ? [Github({
                clientId: process.env.GITHUB_AUTH_CLIENT_ID,
                clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
              })]
            : []),
        ...(process.env.GOOGLE_AUTH_CLIENT_ID && process.env.GOOGLE_AUTH_CLIENT_SECRET
            ? [Google({
                clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
                clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
              })]
            : []),
        Credentials({
            async authorize(credentials) {
                const user = await validateCredential(
                    credentials as SignInCredential,
                )

                if (!user) return null

                // Izin & peran efektif (rombak RBAC): dipakai menyembunyikan menu/tombol di UI.
                const profil = await fetchProfilSesi(user.accessToken)

                return {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    image: user.avatar,
                    role: user.role,
                    companyId: user.companyId,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    izin: profil?.izin ?? [],
                    namaPeran: profil?.namaPeran ?? null,
                    superAdmin: profil?.superAdmin ?? false,
                    isOwner: profil?.isOwner ?? false,
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
                token.izin = user.izin ?? []
                token.namaPeran = user.namaPeran ?? null
                token.superAdmin = user.superAdmin ?? false
                token.isOwner = user.isOwner ?? false
                token.izinDiambil = Date.now()
            } else if (
                token.accessToken &&
                !isJwtExpired(token.accessToken) &&
                Date.now() - (token.izinDiambil ?? 0) > IZIN_SEGAR_MS
            ) {
                // Perubahan peran/izin oleh admin ikut terbawa tanpa harus login ulang.
                const profil = await fetchProfilSesi(token.accessToken)
                if (profil) {
                    token.izin = profil.izin
                    token.namaPeran = profil.namaPeran
                    token.superAdmin = profil.superAdmin
                    token.isOwner = profil.isOwner
                }
                token.izinDiambil = Date.now()
            }

            // Token backend expired → return null untuk menghancurkan session
            // NextAuth, sehingga middleware langsung redirect ke halaman login
            if (token.accessToken && isJwtExpired(token.accessToken)) {
                return null
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
                    authority: token.superAdmin ? ['superadmin'] : (token.izin ?? []),
                    izin: token.izin ?? [],
                    namaPeran: token.namaPeran ?? null,
                    superAdmin: token.superAdmin ?? false,
                    isOwner: token.isOwner ?? false,
                },
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            }
        },
    },
} satisfies NextAuthConfig
