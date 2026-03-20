'use client'

import { Card, Tag, Button } from '@/components/ui'
import { HiPencilAlt, HiTrash, HiMenuAlt2 } from 'react-icons/hi'
import type { IModul } from '@/@types/modul.types'

interface ModulCardProps {
    modul: IModul
    onEdit: (modul: IModul) => void
    onDelete: (modul: IModul) => void
}

const ModulCard = ({ modul, onEdit, onDelete }: ModulCardProps) => {
    return (
        <Card className="border-t-4 border-t-indigo-500">
            <div className="flex items-start justify-between mb-3">
                <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100">
                    {modul.kode_modul}
                </Tag>
                <Tag
                    className={
                        modul.aktif === 1
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-500'
                    }
                >
                    {modul.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                </Tag>
            </div>

            <h6 className="font-bold mb-2">{modul.nama}</h6>

            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                <HiMenuAlt2 className="text-base" />
                <span>
                    Urutan{' '}
                    <span className="font-semibold text-gray-700">
                        #{modul.urutan}
                    </span>
                </span>
            </div>

            {modul.deskripsi && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                    {modul.deskripsi}
                </p>
            )}

            <div className="flex gap-2 mt-4">
                <Button
                    size="sm"
                    className="flex-1"
                    icon={<HiPencilAlt />}
                    onClick={() => onEdit(modul)}
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
                    onClick={() => onDelete(modul)}
                >
                    Hapus
                </Button>
            </div>
        </Card>
    )
}

export default ModulCard
