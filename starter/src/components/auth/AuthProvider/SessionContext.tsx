'use client'

import { createContext } from 'react'

type Session = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: Record<string, any>
    expires: string
}

export type { Session }

const SessionContext = createContext<Session | null>({
    expires: '',
})

export default SessionContext
