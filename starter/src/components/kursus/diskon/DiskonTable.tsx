'use client'

import Tag from '@/components/ui/Tag'
import Table from '@/components/ui/Table'
import type { IDiskon } from '@/@types/kursus.types'

const { Tr, Th, Td, THead, TBody } = Table

interface DiskonTableProps {
    data: IDiskon[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (size: number) => void
    onEdit: (item: IDiskon) => void
    onDelete: (item: IDiskon) => void
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

const formatTanggal = (value: string | null) => {
    if (!value) return '-'
    const d = new Date(value)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const DiskonTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: DiskonTableProps) => {
    const { total, pageIndex, pageSize } = pagingData
    const startNo = (pageIndex - 1) * pageSize + 1

    return (
        <Table
            loading={loading}
            paginate
            pagination={{
                total,
                currentPage: pageIndex,
                pageSize,
                onChange: onPaginationChange,
                onChangePage: onSelectChange,
            }}
        >
            <THead>
                <Tr>
                    <Th width={50}>No</Th>
                    <Th>Kode</Th>
                    <Th>Nama Diskon</Th>
                    <Th>Diskon</Th>
                    <Th>Berlaku</Th>
                    <Th>Status</Th>
                    <Th width={120}>Aksi</Th>
                </Tr>
            </THead>
            <TBody>
                {data.length === 0 && !loading ? (
                    <Tr>
                        <Td colSpan={7} className="text-center text-gray-400 py-8">
                            Tidak ada data
                        </Td>
                    </Tr>
                ) : (
                    data.map((item, i) => {
                        const diskonText =
                            item.persentase != null
                                ? `${item.persentase}%`
                                : item.harga != null
                                ? formatRupiah(item.harga)
                                : '-'

                        const berlaku =
                            item.berlaku_mulai || item.berlaku_sampai
                                ? `${formatTanggal(item.berlaku_mulai)} – ${formatTanggal(item.berlaku_sampai)}`
                                : '-'

                        return (
                            <Tr key={item.id_diskon}>
                                <Td className="text-center">{startNo + i}</Td>
                                <Td>
                                    <span className="font-mono text-sm font-semibold">{item.kode_diskon}</span>
                                </Td>
                                <Td>{item.nama_diskon}</Td>
                                <Td className="font-medium">{diskonText}</Td>
                                <Td className="text-sm">{berlaku}</Td>
                                <Td>
                                    <Tag
                                        className={`${
                                            item.aktif === 1
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-red-100 text-red-600'
                                        } border-0`}
                                    >
                                        {item.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                                    </Tag>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="cursor-pointer select-none font-medium text-blue-600 hover:text-blue-800 text-sm"
                                            onClick={() => onEdit(item)}
                                        >
                                            Edit
                                        </span>
                                        <span
                                            className="cursor-pointer select-none font-medium text-red-500 hover:text-red-700 text-sm"
                                            onClick={() => onDelete(item)}
                                        >
                                            Hapus
                                        </span>
                                    </div>
                                </Td>
                            </Tr>
                        )
                    })
                )}
            </TBody>
        </Table>
    )
}

export default DiskonTable
