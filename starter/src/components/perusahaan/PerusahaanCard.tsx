'use client'

import { Card, Tag, Button } from '@/components/ui'
import { HiPencilAlt, HiTrash, HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import type { IPerusahaan } from '@/@types/perusahaan.types'

interface PerusahaanCardProps {
    perusahaan: IPerusahaan
    onEdit: (perusahaan: IPerusahaan) => void
    onDelete: (perusahaan: IPerusahaan) => void
}

const PerusahaanCard = ({ perusahaan, onEdit, onDelete }: PerusahaanCardProps) => {
    return (
        <Card className="border-t-4 border-t-indigo-500">
            <div className="flex items-start justify-between mb-3">
                {/* Logo / Inisial */}
                {perusahaan.url_logo ? (
                    <img
                        src={perusahaan.url_logo}
                        alt={perusahaan.nama}
                        className="w-10 h-10 rounded object-contain border border-gray-100 dark:border-gray-700 bg-white"
                        onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                            {perusahaan.nama.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <Tag
                    className={
                        perusahaan.aktif === 1
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-500'
                    }
                >
                    {perusahaan.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                </Tag>
            </div>

            <h6 className="font-bold mb-3">{perusahaan.nama}</h6>

            <div className="flex flex-col gap-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
                {perusahaan.email && (
                    <div className="flex items-center gap-2">
                        <HiMail className="shrink-0" />
                        <span className="truncate">{perusahaan.email}</span>
                    </div>
                )}
                {perusahaan.telepon && (
                    <div className="flex items-center gap-2">
                        <HiPhone className="shrink-0" />
                        <span>{perusahaan.telepon}</span>
                    </div>
                )}
                {perusahaan.alamat && (
                    <div className="flex items-start gap-2">
                        <HiLocationMarker className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-xs">{perusahaan.alamat}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    className="flex-1"
                    icon={<HiPencilAlt />}
                    onClick={() => onEdit(perusahaan)}
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
                    onClick={() => onDelete(perusahaan)}
                >
                    Hapus
                </Button>
            </div>
        </Card>
    )
}

export default PerusahaanCard
