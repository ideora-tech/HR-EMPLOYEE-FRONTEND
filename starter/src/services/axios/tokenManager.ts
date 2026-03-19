const TOKEN_KEY = 'access_token'

export const setAccessToken = (token: string | null) => {
    if (typeof window === 'undefined') return
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }
}

export const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
}
