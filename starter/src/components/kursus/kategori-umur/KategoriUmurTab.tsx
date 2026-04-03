'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Notification, Select, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import KategoriUmurTable from '@/components/kursus/kategori-umur/KategoriUmurTable'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IKategoriUmur } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const KategoriUmurTab = () => {
    const router = useRouter()
    const [list, setList] = useState<IKategoriUmur[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<IKategoriUmur | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await KategoriUmurService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? Number(aktifFilter) : undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.KATEGORI_UMUR)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, currentPage, pageSize])

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

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await KategoriUmurService.remove(deleteTarget.id_kategori_umur)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.KATEGORI_UMUR)} />)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.KATEGORI_UMUR)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3 px-4 pb-3">
                <Input
                    className="flex-1"
                    placeholder="Cari nama kategori... (tekan Enter)"
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
                <Select<AktifOption>
                    className="w-44"
                    options={AKTIF_OPTIONS}
                    value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                    onChange={(opt) => { setAktifFilter((opt as AktifOption).value); setCurrentPage(1) }}
                />
            </div>

            <KategoriUmurTable
                data={list}
                loading={loading}
                pagingData={{ total, pageIndex: currentPage, pageSize }}
                onPaginationChange={setCurrentPage}
                onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                onEdit={(item) => router.push(ROUTES.KURSUS_KATEGORI_UMUR_EDIT(item.id_kategori_umur))}
                onDelete={setDeleteTarget}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Kategori Umur?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setDeleteTarget(null)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            >
                <p className="text-sm">
                    Kategori{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_kategori_umur}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default KategoriUmurTab
