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

export async function getNavigation(): Promise<NavigationTree[]> {
    try {
        const session = await auth()
        if (!session?.accessToken) return navigationConfig

        const backendUrl = process.env.BACKEND_API_URL
        if (!backendUrl) return navigationConfig

        const res = await fetch(`${backendUrl}/menu/me`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) return navigationConfig

        const json = await res.json()
        if (!json.success || !Array.isArray(json.data)) return navigationConfig

        return json.data.map(toNavTree)
    } catch {
        return navigationConfig
    }
}
