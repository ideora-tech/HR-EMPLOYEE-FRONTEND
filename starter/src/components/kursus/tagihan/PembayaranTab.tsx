'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Notification, Select, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import PembayaranTable from '@/components/kursus/pembayaran/PembayaranTable'
import PembayaranDetailDrawer from '@/components/kursus/pembayaran/PembayaranDetailDrawer'
import PembayaranService from '@/services/kursus/pembayaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IPembayaran } from '@/@types/kursus.types'

type MetodeOption = { value: '' | 'TUNAI' | 'TRANSFER' | 'QRIS'; label: string }

const METODE_OPTIONS: MetodeOption[] = [
    { value: '', label: 'Semua Metode' },
    { value: 'TUNAI', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer Bank' },
    { value: 'QRIS', label: 'QRIS' },
]

const PembayaranTab = () => {
    const router = useRouter()
    const [list, setList] = useState<IPembayaran[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [metodeFilter, setMetodeFilter] = useState<'' | 'TUNAI' | 'TRANSFER' | 'QRIS'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<IPembayaran | null>(null)
    const [detailTarget, setDetailTarget] = useState<IPembayaran | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await PembayaranService.getAll({
                search: search || undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.PEMBAYARAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, currentPage, pageSize])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSearchSubmit = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }

    const [alasanHapus, setAlasanHapus] = useState('')

    const handleDelete = async () => {
        if (!deleteTarget) return
        const alasan = alasanHapus.trim()
        if (!alasan) return
        setSubmitting(true)
        try {
            await PembayaranService.remove(deleteTarget.id_pembayaran, alasan)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.PEMBAYARAN)} />,
            )
            setDeleteTarget(null)
            setAlasanHapus('')
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.PEMBAYARAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const filteredList = metodeFilter
        ? list.filter((p) => p.metode === metodeFilter)
        : list

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 pb-3">
                <Input
                    className="flex-1 w-full"
                    placeholder="Cari nama siswa... (tekan Enter)"
                    suffix={
                        searchInput ? (
                            <HiOutlineX
                                className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                onClick={handleSearchClear}
                            />
                        ) : (
                            <HiOutlineSearch
                                className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                onClick={handleSearchSubmit}
                            />
                        )
                    }
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
                />
                <Select
                    className="w-full sm:w-48"
                    options={METODE_OPTIONS}
                    value={METODE_OPTIONS.find((o) => o.value === metodeFilter)}
                    onChange={(opt) => {
                        setMetodeFilter((opt as MetodeOption).value)
                        setCurrentPage(1)
                    }}
                />
                <Button
                    variant="solid"
                    size="sm"
                    icon={<HiPlusCircle />}
                    onClick={() => router.push(ROUTES.KURSUS_TAGIHAN_CATAT_PEMBAYARAN)}
                >
                    Catat Pembayaran
                </Button>
            </div>

            <PembayaranTable
                data={filteredList}
                loading={loading}
                pagingData={{ total, pageIndex: currentPage, pageSize }}
                onPaginationChange={setCurrentPage}
                onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                onDetail={setDetailTarget}
                onDelete={setDeleteTarget}
            />

            <PembayaranDetailDrawer
                open={!!detailTarget}
                pembayaran={detailTarget}
                onClose={() => setDetailTarget(null)}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Pembayaran?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    disabled: !alasanHapus.trim(),
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => { setDeleteTarget(null); setAlasanHapus('') }}
                onCancel={() => { setDeleteTarget(null); setAlasanHapus('') }}
                onConfirm={handleDelete}
            >
                <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                        Alasan penghapusan <span className="text-red-500">*</span>
                    </p>
                    <Input
                        textArea
                        rows={2}
                        placeholder="Mis. salah input nominal, dicatat ulang"
                        value={alasanHapus}
                        maxLength={255}
                        onChange={(e) => setAlasanHapus(e.target.value)}
                    />
                </div>
                <p className="text-sm">
                    Data pembayaran{' '}
                    {deleteTarget?.tagihan?.nama_siswa && (
                        <>
                            siswa{' '}
                            <span className="font-semibold">
                                &ldquo;{deleteTarget.tagihan.nama_siswa}&rdquo;
                            </span>{' '}
                        </>
                    )}
                    akan dihapus. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default PembayaranTab
