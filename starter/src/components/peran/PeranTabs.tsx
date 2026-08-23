'use client'

import QueryTabs from '@/components/shared/QueryTabs'
import PeranPanel from '@/components/peran/PeranPanel'
import IzinPeranPanel from '@/components/izin-peran/IzinPeranPanel'
import MenuPanel from '@/components/menu/MenuPanel'

/** Nilai query `?tab=` di halaman /peran — dipakai juga oleh redirect halaman lama. */
export const PERAN_TAB = {
    PERAN: 'peran',
    IZIN: 'izin-peran',
    MENU: 'menu',
} as const

/** Satu halaman untuk pengaturan akses: Peran, Izin Peran, dan Menu. */
const PeranTabs = () => (
    <QueryTabs
        defaultValue={PERAN_TAB.PERAN}
        tabs={[
            { value: PERAN_TAB.PERAN, label: 'Peran', content: <PeranPanel /> },
            { value: PERAN_TAB.IZIN, label: 'Izin Peran', content: <IzinPeranPanel /> },
            { value: PERAN_TAB.MENU, label: 'Menu', content: <MenuPanel /> },
        ]}
    />
)

export default PeranTabs
