'use client'

import { useMemo, useState } from 'react'
import { Checkbox, Input } from '@/components/ui'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import type { IItemIzin } from '@/@types/peran.types'
import {
    ACTION_LABEL,
    STANDARD_ACTIONS,
    buildGroupedMatrix,
    rowCodes,
    toggleRow,
    type MatrixRow,
} from '@/utils/permissionMatrix'

type PermissionMatrixProps = {
    catalog: IItemIzin[]
    value: string[]
    onChange: (codes: string[]) => void
    disabled?: boolean
}

const MATRIX_COLUMN_COUNT = 2 + STANDARD_ACTIONS.length + 1

const EmptyCell = () => <span className="text-gray-300 dark:text-gray-600">—</span>

/**
 * Matriks izin peran/paket (diadaptasi dari POS_IDEORA): Menu | Semua | Lihat | Tambah | Ubah | Hapus | Aksi khusus.
 * Mencentang "Lihat" menentukan apakah menu tampil di sidebar.
 */
const PermissionMatrix = ({ catalog, value, onChange, disabled = false }: PermissionMatrixProps) => {
    const [search, setSearch] = useState('')
    const lines = useMemo(() => buildGroupedMatrix(catalog, search), [catalog, search])
    const checked = useMemo(() => new Set(value), [value])

    const toggleCode = (code: string, isChecked: boolean) => {
        const next = new Set(value)
        if (isChecked) next.add(code)
        else next.delete(code)
        onChange([...next])
    }

    const toggleWholeRow = (row: MatrixRow) => onChange([...toggleRow(row, new Set(value))])

    return (
        <div className="flex flex-col gap-3">
            <Input
                className="max-w-md"
                placeholder="Cari menu atau aksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                suffix={
                    search ? (
                        <HiOutlineX className="text-gray-400 text-lg cursor-pointer" onClick={() => setSearch('')} />
                    ) : (
                        <HiOutlineSearch className="text-gray-400 text-lg" />
                    )
                }
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[640px]">
                    <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-600">
                            <th className="py-2 pr-4">Menu</th>
                            <th className="py-2 px-2 text-center">Semua</th>
                            {STANDARD_ACTIONS.map((action) => (
                                <th key={action} className="py-2 px-2 text-center whitespace-nowrap">
                                    {ACTION_LABEL[action]}
                                </th>
                            ))}
                            <th className="py-2 pl-2">Aksi khusus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.length === 0 && (
                            <tr>
                                <td colSpan={MATRIX_COLUMN_COUNT} className="py-6 text-center text-gray-400">
                                    Tidak ada menu/aksi yang cocok
                                </td>
                            </tr>
                        )}
                        {lines.map((line) => {
                            if (line.kind === 'grup') {
                                return (
                                    <tr key={`grup:${line.key}`}>
                                        <td
                                            colSpan={MATRIX_COLUMN_COUNT}
                                            className="bg-gray-50 dark:bg-gray-700/40 font-semibold text-xs uppercase tracking-wide py-2 px-4"
                                        >
                                            {line.title}
                                        </td>
                                    </tr>
                                )
                            }
                            const { row } = line
                            const codes = rowCodes(row)
                            const allChecked = codes.length > 0 && codes.every((c) => checked.has(c))
                            return (
                                <tr key={`izin:${row.menu}`} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2 pr-4 pl-4">{row.label}</td>
                                    <td className="py-2 px-2 text-center">
                                        <Checkbox
                                            checked={allChecked}
                                            disabled={disabled}
                                            onChange={() => toggleWholeRow(row)}
                                        />
                                    </td>
                                    {STANDARD_ACTIONS.map((action) => {
                                        const code = row.standard[action]
                                        return (
                                            <td key={action} className="py-2 px-2 text-center">
                                                {code ? (
                                                    <Checkbox
                                                        checked={checked.has(code)}
                                                        disabled={disabled}
                                                        onChange={(isChecked: boolean) => toggleCode(code, isChecked)}
                                                    />
                                                ) : (
                                                    <EmptyCell />
                                                )}
                                            </td>
                                        )
                                    })}
                                    <td className="py-2 pl-2">
                                        {row.special.length === 0 ? (
                                            <EmptyCell />
                                        ) : (
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                {row.special.map((s) => (
                                                    <Checkbox
                                                        key={s.code}
                                                        checked={checked.has(s.code)}
                                                        disabled={disabled}
                                                        onChange={(isChecked: boolean) => toggleCode(s.code, isChecked)}
                                                    >
                                                        {s.name}
                                                    </Checkbox>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PermissionMatrix
