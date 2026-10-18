'use client'

import { Tag } from '@/components/ui'
import type { IPengguna } from '@/@types/pengguna.types'

/** Semua peran pengguna; Owner (peran bawaan) diberi warna berbeda. Tanpa daftar → kode peran lama. */
const PeranBadges = ({ pengguna }: { pengguna: IPengguna }) => {
    const daftar = pengguna.peran_list ?? []
    if (daftar.length === 0) {
        return <Tag className="bg-gray-100 text-gray-600">{pengguna.peran}</Tag>
    }
    return (
        <div className="flex flex-wrap gap-1">
            {daftar.map((p) => (
                <Tag
                    key={p.id_peran}
                    className={
                        p.is_sistem === 1
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100'
                    }
                >
                    {p.nama_peran}
                </Tag>
            ))}
        </div>
    )
}

export default PeranBadges
