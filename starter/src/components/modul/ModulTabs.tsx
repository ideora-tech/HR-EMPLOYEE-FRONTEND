'use client'

import QueryTabs from '@/components/shared/QueryTabs'
import ModulPanel from '@/components/modul/ModulPanel'
import AksesModulPanel from '@/components/akses-modul/AksesModulPanel'
import MenuModulPanel from '@/components/menu-modul/MenuModulPanel'
import PaketPanel from '@/components/paket/PaketPanel'

/** Nilai query `?tab=` di halaman /modul — dipakai juga oleh redirect halaman lama. */
export const MODUL_TAB = {
    MODUL: 'modul',
    AKSES: 'akses-modul',
    MENU: 'menu-modul',
    PAKET: 'paket',
} as const

/**
 * Satu halaman untuk pengaturan modul: Modul, Akses Modul (per paket),
 * Menu Modul, dan Paket langganan.
 */
const ModulTabs = () => (
    <QueryTabs
        defaultValue={MODUL_TAB.MODUL}
        tabs={[
            { value: MODUL_TAB.MODUL, label: 'Modul', content: <ModulPanel /> },
            { value: MODUL_TAB.AKSES, label: 'Akses Modul', content: <AksesModulPanel /> },
            { value: MODUL_TAB.MENU, label: 'Menu Modul', content: <MenuModulPanel /> },
            { value: MODUL_TAB.PAKET, label: 'Paket', content: <PaketPanel /> },
        ]}
    />
)

export default ModulTabs
