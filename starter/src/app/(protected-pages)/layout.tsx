import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import TokenSync from '@/components/auth/TokenSync'
import { getNavigationWithMeta } from '@/server/actions/navigation/getNavigation'
import type { NavigationTree } from '@/@types/navigation'
import type { ReactNode } from 'react'

/**
 * Kumpulkan semua path dari navigation tree secara rekursif.
 * Hanya path yang tidak kosong yang dikembalikan.
 */
function extractMenuPaths(tree: NavigationTree[]): string[] {
    const paths: string[] = []
    for (const item of tree) {
        if (item.path) paths.push(item.path)
        if (item.subMenu?.length) paths.push(...extractMenuPaths(item.subMenu))
    }
    return paths
}

/**
 * Path yang selalu boleh diakses meski tidak ada di menu backend.
 * (entry point utama setelah login)
 */
const ALWAYS_ALLOWED = ['/home']

const Layout = async ({ children }: { children: ReactNode }) => {
    const { tree, fromBackend } = await getNavigationWithMeta()

    /**
     * Route-guard: hanya aktif jika navigation berasal dari backend.
     * Jika fallback ke static config (backend down / tidak ada token),
     * akses tidak diblokir.
     */
    if (fromBackend) {
        const headersList = await headers()
        const pathname = headersList.get('x-pathname') ?? ''

        const menuPaths = extractMenuPaths(tree)

        const isAllowed =
            ALWAYS_ALLOWED.some(
                (p) => pathname === p || pathname.startsWith(p + '/'),
            ) ||
            menuPaths.some(
                (p) => p && (pathname === p || pathname.startsWith(p + '/')),
            )

        if (!isAllowed) {
            redirect('/not-authorized')
        }
    }

    return (
        <PostLoginLayout>
            <TokenSync />
            {children}
        </PostLoginLayout>
    )
}

export default Layout
