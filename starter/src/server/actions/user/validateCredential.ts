'use server'
import type { SignInCredential, BackendLoginResponse } from '@/@types/auth'

const validateCredential = async (values: SignInCredential) => {
    const { email, password } = values

    try {
        const response = await fetch(
            `${process.env.BACKEND_API_URL}/auth/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ email, password }),
            },
        )

        if (!response.ok) return null

        const data: BackendLoginResponse = await response.json()

        if (!data.success) return null

        const { user, tokens } = data.data

        return {
            id: user.id,
            userName: user.name,
            email: user.email,
            avatar: '',
            role: user.role,
            companyId: user.company_id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
        }
    } catch (error) {
        console.error('Login error:', error)
        return null
    }
}

export default validateCredential
