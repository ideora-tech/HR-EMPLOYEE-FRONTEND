'use server'

import { signOut } from '@/auth'
import { redirect } from 'next/navigation'
import appConfig from '@/configs/app.config'

const handleSignOut = async () => {
    await signOut({ redirect: false })
    redirect(appConfig.unAuthenticatedEntryPath)
}

export default handleSignOut
