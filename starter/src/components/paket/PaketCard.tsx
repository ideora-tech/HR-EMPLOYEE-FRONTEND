'use client'

import { Card, Tag, Button } from '@/components/ui'
import { HiPencilAlt, HiTrash, HiUsers } from 'react-icons/hi'
import type { IPaket, KodePaket } from '@/@types/paket.types'

const KODE_CONFIG: Record<
    KodePaket,
    { tagClass: string; accentClass: string }
> = {
    FREE: {
        tagClass: 'bg-gray-100 text-gray-600',
        accentClass: 'border-t-4 border-t-gray-400',
    },
    STARTER: {
        tagClass: 'bg-blue-100 text-blue-600',
        accentClass: 'border-t-4 border-t-blue-500',
    },
    PROFESSIONAL: {
        tagClass: 'bg-violet-100 text-violet-600',
        accentClass: 'border-t-4 border-t-violet-500',
    },
    ENTERPRISE: {
        tagClass: 'bg-amber-100 text-amber-600',
        accentClass: 'border-t-4 border-t-amber-500',
    },
}

interface PaketCardProps {
    paket: IPaket
    onEdit: (paket: IPaket) => void
    onDelete: (paket: IPaket) => void
}

const PaketCard = ({ paket, onEdit, onDelete }: PaketCardProps) => {
    const config = KODE_CONFIG[paket.kode_paket]
    const maksLabel =
        paket.maks_karyawan >= 999999
            ? 'Unlimited'
            : paket.maks_karyawan.toLocaleString('id-ID')

    return (
        <Card className={config.accentClass}>
            <div className="flex items-start justify-between mb-4">
                <Tag className={config.tagClass}>{paket.kode_paket}</Tag>
                <Tag
                    className={
                        paket.aktif === 1
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-500'
                    }
                >
                    {paket.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                </Tag>
            </div>

            <h6 className="font-bold mb-1">{paket.nama}</h6>

            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <HiUsers className="text-base" />
                <span>
                    Maks.{' '}
                    <span className="font-semibold text-gray-700">
                        {maksLabel}
                    </span>{' '}
                    karyawan
                </span>
            </div>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    className="flex-1"
                    icon={<HiPencilAlt />}
                    onClick={() => onEdit(paket)}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    className="flex-1"
                    customColorClass={() =>
                        'border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20'
                    }
                    icon={<HiTrash />}
                    onClick={() => onDelete(paket)}
                >
                    Hapus
                </Button>
            </div>
        </Card>
    )
}

export default PaketCard
