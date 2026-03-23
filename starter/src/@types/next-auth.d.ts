import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id?: string
            name?: string | null
            email?: string | null
            image?: string | null
            authority?: string[]
            role?: string | null
            companyId?: string | null
        }
        accessToken?: string | null
        refreshToken?: string | null
    }

    interface User {
        role?: string | null
        companyId?: string | null
        accessToken?: string | null
        refreshToken?: string | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string | null
        companyId?: string | null
        accessToken?: string | null
        refreshToken?: string | null
    }
}
