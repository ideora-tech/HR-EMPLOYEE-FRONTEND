'use client'

import QueryTabs from '@/components/shared/QueryTabs'
import PeranPanel from '@/components/peran/PeranPanel'

/** Nilai query `?tab=` di halaman /peran — dipakai juga oleh redirect halaman lama. */
export const PERAN_TAB = {
    PERAN: 'peran',
    // Tab "Izin Peran" lama digantikan matriks izin per peran (/peran/[id]); nilai dipertahankan untuk link lama.
    IZIN: 'izin-peran',
} as const

/** Halaman Peran & Akses: daftar peran perusahaan; izin tiap peran diatur di /peran/[id]. */
const PeranTabs = () => (
    <QueryTabs
        title="Peran & Akses"
        defaultValue={PERAN_TAB.PERAN}
        tabs={[{ value: PERAN_TAB.PERAN, label: 'Peran', content: <PeranPanel /> }]}
    />
)

export default PeranTabs
