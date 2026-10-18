'use client'

import { Card, Tag, Button } from '@/components/ui'
import { HiPencilAlt, HiTrash } from 'react-icons/hi'
import type { IPengguna } from '@/@types/pengguna.types'
import PeranBadges from '@/components/pengguna/PeranBadges'

interface PenggunaCardProps {
    pengguna: IPengguna
    onEdit: (pengguna: IPengguna) => void
    onDelete: (pengguna: IPengguna) => void
    bolehUbah: boolean
    bolehHapus: boolean
}

const PenggunaCard = ({ pengguna, onEdit, onDelete, bolehUbah, bolehHapus }: PenggunaCardProps) => {
    return (
        <Card className="border-t-4 border-t-indigo-500">
            <div className="flex items-start justify-between mb-3">
                <PeranBadges pengguna={pengguna} />
                <Tag
                    className={
                        pengguna.aktif === 1
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-500'
                    }
                >
                    {pengguna.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                </Tag>
            </div>

            <h6 className="font-bold mb-1">{pengguna.nama_pengguna}</h6>
            <p className="text-sm text-gray-400 mb-4">{pengguna.email}</p>

            <div className="flex gap-2">
                {bolehUbah && (
                    <Button
                        size="sm"
                        className="flex-1"
                        icon={<HiPencilAlt />}
                        onClick={() => onEdit(pengguna)}
                    >
                        Edit
                    </Button>
                )}
                {bolehHapus && (
                    <Button
                        size="sm"
                        className="flex-1"
                        customColorClass={() =>
                            'border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20'
                        }
                        icon={<HiTrash />}
                        onClick={() => onDelete(pengguna)}
                    >
                        Hapus
                    </Button>
                )}
            </div>
        </Card>
    )
}

export default PenggunaCard
