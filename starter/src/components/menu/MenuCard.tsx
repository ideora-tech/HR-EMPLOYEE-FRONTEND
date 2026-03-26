'use client'

import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash, HiMenuAlt2, HiLink, HiViewGrid } from 'react-icons/hi'
import type { IMenu } from '@/@types/menu.types'

interface MenuCardProps {
    menu: IMenu
    onEdit: (item: IMenu) => void
    onDelete: (item: IMenu) => void
}

const MenuCard = ({ menu, onEdit, onDelete }: MenuCardProps) => {
    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-gray-800 dark:text-gray-100 truncate">
                        {menu.nama_menu}
                    </div>
                    {menu.kode_modul ? (
                        <Tag className="mt-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100 text-xs">
                            {menu.kode_modul}
                        </Tag>
                    ) : (
                        <span className="mt-1 inline-block text-xs text-gray-400 italic">
                            selalu tampil
                        </span>
                    )}
                </div>
                <Tag
                    className={
                        menu.aktif === 1
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 shrink-0'
                            : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100 shrink-0'
                    }
                >
                    {menu.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                </Tag>
            </div>

            {/* Detail */}
            <div className="flex flex-col gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                    <HiLink className="shrink-0 text-gray-400" />
                    <span className="font-mono text-xs truncate">{menu.path || '—'}</span>
                </div>
                {menu.icon && (
                    <div className="flex items-center gap-1.5">
                        <HiViewGrid className="shrink-0 text-gray-400" />
                        <span className="text-xs">{menu.icon}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <HiMenuAlt2 className="shrink-0 text-gray-400" />
                    <span>Urutan: {menu.urutan}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50 dark:border-gray-700">
                <Tooltip title="Edit">
                    <span
                        className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                        onClick={() => onEdit(menu)}
                    >
                        <HiOutlinePencilAlt className="text-lg" />
                    </span>
                </Tooltip>
                <Tooltip title="Hapus">
                    <span
                        className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                        onClick={() => onDelete(menu)}
                    >
                        <HiOutlineTrash className="text-lg" />
                    </span>
                </Tooltip>
            </div>
        </div>
    )
}

export default MenuCard
