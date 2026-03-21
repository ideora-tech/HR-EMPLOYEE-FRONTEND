'use client'

import { Card, Tag, Button } from '@/components/ui'
import { HiPencilAlt, HiTrash } from 'react-icons/hi'
import type { IPengguna } from '@/@types/pengguna.types'

interface PenggunaCardProps {
    pengguna: IPengguna
    onEdit: (pengguna: IPengguna) => void
    onDelete: (pengguna: IPengguna) => void
}

const PERAN_COLOR: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100',
    HR_ADMIN: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100',
    FINANCE: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
    EMPLOYEE: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100',
}

const PenggunaCard = ({ pengguna, onEdit, onDelete }: PenggunaCardProps) => {
    return (
        <Card className="border-t-4 border-t-indigo-500">
            <div className="flex items-start justify-between mb-3">
                <Tag
                    className={
                        PERAN_COLOR[pengguna.peran] ?? 'bg-gray-100 text-gray-600'
                    }
                >
                    {pengguna.peran}
                </Tag>
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

            <h6 className="font-bold mb-1">{pengguna.nama}</h6>
            <p className="text-sm text-gray-400 mb-4">{pengguna.email}</p>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    className="flex-1"
                    icon={<HiPencilAlt />}
                    onClick={() => onEdit(pengguna)}
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
                    onClick={() => onDelete(pengguna)}
                >
                    Hapus
                </Button>
            </div>
        </Card>
    )
}

export default PenggunaCard
