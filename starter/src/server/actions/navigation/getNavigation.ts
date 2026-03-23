import { cache } from 'react'
import { auth } from '@/auth'
import navigationConfig from '@/configs/navigation.config'
import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

interface ApiMenuItem {
    id_menu: string
    nama: string
    icon: string | null
    path: string | null
    kode_modul: string | null
    parent_id: string | null
    urutan: number
    aktif: number
    children: ApiMenuItem[]
}

function toNavTree(item: ApiMenuItem): NavigationTree {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    return {
        key: item.id_menu,
        path: item.path ?? '',
        title: item.nama,
        translateKey: item.nama,
        icon: item.icon ?? '',
        type: hasChildren ? NAV_ITEM_TYPE_COLLAPSE : NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: hasChildren ? item.children.map(toNavTree) : [],
    }
}

/**
 * Internal cached fetch — deduplicated within a single render pass (React cache).
 * Returns the navigation tree and a flag indicating whether it came from the backend.
 */
const fetchNavigation = cache(async (): Promise<{
    tree: NavigationTree[]
    fromBackend: boolean
}> => {
    try {
        const session = await auth()
        if (!session?.accessToken) return { tree: navigationConfig, fromBackend: false }

        const backendUrl = process.env.BACKEND_API_URL
        if (!backendUrl) return { tree: navigationConfig, fromBackend: false }

        const res = await fetch(`${backendUrl}/menu/me`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) return { tree: navigationConfig, fromBackend: false }

        const json = await res.json()
        if (!json.success || !Array.isArray(json.data))
            return { tree: navigationConfig, fromBackend: false }

        return { tree: json.data.map(toNavTree), fromBackend: true }
    } catch {
        return { tree: navigationConfig, fromBackend: false }
    }
})

/** Returns the navigation tree (backward-compatible). */
export async function getNavigation(): Promise<NavigationTree[]> {
    const { tree } = await fetchNavigation()
    return tree
}

/**
 * Returns the navigation tree together with a `fromBackend` flag.
 * Use this when you need to distinguish backend data from the static fallback
 * (e.g. for route-level access control).
 */
export async function getNavigationWithMeta() {
    return fetchNavigation()
}
