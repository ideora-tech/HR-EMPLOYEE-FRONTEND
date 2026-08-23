'use client'

import QueryTabs from '@/components/shared/QueryTabs'
import PeranPanel from '@/components/peran/PeranPanel'
import IzinPeranPanel from '@/components/izin-peran/IzinPeranPanel'

/** Nilai query `?tab=` di halaman /peran — dipakai juga oleh redirect halaman lama. */
export const PERAN_TAB = {
    PERAN: 'peran',
    IZIN: 'izin-peran',
} as const

/** Satu halaman untuk pengaturan akses: Peran dan Izin Peran. (Manajemen Menu pindah ke halaman Modul.) */
const PeranTabs = () => (
    <QueryTabs
        title="Peran & Akses"
        defaultValue={PERAN_TAB.PERAN}
        tabs={[
            { value: PERAN_TAB.PERAN, label: 'Peran', content: <PeranPanel /> },
            { value: PERAN_TAB.IZIN, label: 'Izin Peran', content: <IzinPeranPanel /> },
        ]}
    />
)

export default PeranTabs
