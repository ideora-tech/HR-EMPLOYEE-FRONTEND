'use client'

import QueryTabs from '@/components/shared/QueryTabs'
import ModulPanel from '@/components/modul/ModulPanel'
import IzinPaketPanel from '@/components/izin-paket/IzinPaketPanel'
import PaketPanel from '@/components/paket/PaketPanel'
import MenuPanel from '@/components/menu/MenuPanel'

/** Nilai query `?tab=` di halaman /modul — dipakai juga oleh redirect halaman lama. */
export const MODUL_TAB = {
    MODUL: 'modul',
    IZIN_PAKET: 'izin-paket',
    PAKET: 'paket',
    MANAJEMEN_MENU: 'menu',
} as const

/**
 * Satu halaman untuk pengaturan modul: Paket langganan, Izin Paket (pengganti Akses Modul
 * dan Menu Modul), Modul, dan Manajemen Menu (sidebar).
 */
const ModulTabs = () => (
    <QueryTabs
        title="Pengaturan Modul"
        defaultValue={MODUL_TAB.MODUL}
        tabs={[
            { value: MODUL_TAB.PAKET, label: 'Paket', content: <PaketPanel /> },
            { value: MODUL_TAB.IZIN_PAKET, label: 'Izin Paket', content: <IzinPaketPanel /> },
            { value: MODUL_TAB.MODUL, label: 'Modul', content: <ModulPanel /> },
            { value: MODUL_TAB.MANAJEMEN_MENU, label: 'Menu', content: <MenuPanel /> },
        ]}
    />
)

export default ModulTabs
