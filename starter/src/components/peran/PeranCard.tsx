'use client'

import { Card, Tag, Button } from '@/components/ui'
import { HiKey, HiPencilAlt, HiTrash } from 'react-icons/hi'
import type { IPeran } from '@/@types/peran.types'

interface PeranCardProps {
    peran: IPeran
    onAturIzin: (peran: IPeran) => void
    onEdit: (peran: IPeran) => void
    onDelete: (peran: IPeran) => void
    bolehUbah: boolean
    bolehHapus: boolean
}

const PeranCard = ({ peran, onAturIzin, onEdit, onDelete, bolehUbah, bolehHapus }: PeranCardProps) => {
    const owner = peran.is_sistem === 1
    return (
        <Card className="border-t-4 border-t-indigo-500">
            <div className="flex items-start justify-between mb-3">
                <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100">
                    {peran.kode_peran}
                </Tag>
                <Tag className={peran.aktif === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}>
                    {peran.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                </Tag>
            </div>

            <h6 className="font-bold mb-1">{peran.nama_peran}</h6>
            <p className="text-xs text-gray-500 mb-4">
                {owner ? 'Bawaan · semua izin paket' : `${peran.kode_izin?.length ?? 0} izin`} · {peran.jumlah_pengguna ?? 0} pengguna
            </p>

            <div className="flex gap-2">
                <Button size="sm" className="flex-1" icon={<HiKey />} onClick={() => onAturIzin(peran)}>
                    Izin
                </Button>
                {bolehUbah && !owner && (
                    <Button size="sm" className="flex-1" icon={<HiPencilAlt />} onClick={() => onEdit(peran)}>
                        Ubah
                    </Button>
                )}
                {bolehHapus && !owner && (
                    <Button
                        size="sm"
                        className="flex-1"
                        customColorClass={() => 'border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20'}
                        icon={<HiTrash />}
                        onClick={() => onDelete(peran)}
                    >
                        Hapus
                    </Button>
                )}
            </div>
        </Card>
    )
}

export default PeranCard
