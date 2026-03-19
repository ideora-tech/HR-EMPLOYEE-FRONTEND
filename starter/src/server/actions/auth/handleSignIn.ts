'use server'

import { signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'
import type { SignInCredential } from '@/@types/auth'

export const onSignInWithCredentials = async (
    { email, password }: SignInCredential,
    callbackUrl?: string,
) => {
    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Email atau password salah!' }
                default:
                    return { error: 'Terjadi kesalahan. Silakan coba lagi.' }
            }
        }
        throw error
    }
}
