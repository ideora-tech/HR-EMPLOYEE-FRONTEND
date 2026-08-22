'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs } from '@/components/ui'
import ModulPanel from '@/components/modul/ModulPanel'
import AksesModulPanel from '@/components/akses-modul/AksesModulPanel'
import MenuModulPanel from '@/components/menu-modul/MenuModulPanel'

/** Nilai query `?tab=` di halaman /modul — dipakai juga oleh redirect halaman lama. */
export const MODUL_TAB = {
    MODUL: 'modul',
    AKSES: 'akses-modul',
    MENU: 'menu-modul',
} as const

export type ModulTab = (typeof MODUL_TAB)[keyof typeof MODUL_TAB]

const TAB_VALUES: readonly string[] = Object.values(MODUL_TAB)

const isModulTab = (value: string | null): value is ModulTab =>
    value !== null && TAB_VALUES.includes(value)

/**
 * Satu halaman untuk pengaturan modul: Modul, Akses Modul (per paket), dan
 * Menu Modul. Tab aktif disimpan di query `?tab=` supaya bisa di-bookmark /
 * dibagikan; tab "modul" (default) tidak menulis query.
 */
const ModulTabs = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const rawTab = searchParams.get('tab')
    const activeTab: ModulTab = isModulTab(rawTab) ? rawTab : MODUL_TAB.MODUL

    const handleChange = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value === MODUL_TAB.MODUL) {
                params.delete('tab')
            } else {
                params.set('tab', value)
            }
            const query = params.toString()
            router.replace(query ? `${pathname}?${query}` : pathname)
        },
        [pathname, router, searchParams],
    )

    return (
        <Tabs value={activeTab} onChange={handleChange}>
            <Tabs.TabList>
                <Tabs.TabNav value={MODUL_TAB.MODUL}>Modul</Tabs.TabNav>
                <Tabs.TabNav value={MODUL_TAB.AKSES}>Akses Modul</Tabs.TabNav>
                <Tabs.TabNav value={MODUL_TAB.MENU}>Menu Modul</Tabs.TabNav>
            </Tabs.TabList>
            <div className="mt-4">
                <Tabs.TabContent value={MODUL_TAB.MODUL}>
                    <ModulPanel />
                </Tabs.TabContent>
                <Tabs.TabContent value={MODUL_TAB.AKSES}>
                    <AksesModulPanel />
                </Tabs.TabContent>
                <Tabs.TabContent value={MODUL_TAB.MENU}>
                    <MenuModulPanel />
                </Tabs.TabContent>
            </div>
        </Tabs>
    )
}

export default ModulTabs
