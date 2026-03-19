import React from 'react'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import TokenSync from '@/components/auth/TokenSync'
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <PostLoginLayout>
            <TokenSync />
            {children}
        </PostLoginLayout>
    )
}

export default Layout
