'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Button,
    Card,
    Input,
    Notification,
    Select,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiPlusCircle,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineDownload,
    HiOutlineUpload,
} from 'react-icons/hi'
import KaryawanTable from '@/components/karyawan/KaryawanTable'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IKaryawan } from '@/@types/karyawan.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const KaryawanPage = () => {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [list, setList] = useState<IKaryawan[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [importing, setImporting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<IKaryawan | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await KaryawanService.getAll({
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
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.FETCH(ENTITY.KARYAWAN)}
                >
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
            await KaryawanService.remove(deleteTarget.id_karyawan)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.KARYAWAN)}
                />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.DELETE(ENTITY.KARYAWAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDownloadTemplate = async () => {
        try {
            await KaryawanService.downloadTemplate()
        } catch {
            toast.push(
                <Notification
                    type="danger"
                    title="Gagal mengunduh template Excel"
                />,
            )
        }
    }

    const handleImportExcel = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        // Reset input so same file can be re-selected
        e.target.value = ''
        setImporting(true)
        try {
            const res = await KaryawanService.uploadExcel(file)
            const { berhasil, gagal, errors } = res.data
            if (gagal === 0) {
                toast.push(
                    <Notification type="success" title={`Import berhasil: ${berhasil} karyawan ditambahkan`} />,
                )
            } else {
                toast.push(
                    <Notification type="warning" title={`Import selesai: ${berhasil} berhasil, ${gagal} gagal`}>
                        <ul className="mt-1 list-disc list-inside text-xs">
                            {errors.slice(0, 5).map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                            {errors.length > 5 && (
                                <li>... dan {errors.length - 5} error lainnya</li>
                            )}
                        </ul>
                    </Notification>,
                )
            }
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal mengimpor file Excel">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Karyawan</h4>,
                    extra: (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="default"
                                icon={<HiOutlineDownload />}
                                onClick={handleDownloadTemplate}
                            >
                                Template
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                icon={<HiOutlineUpload />}
                                loading={importing}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Import Excel
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleImportExcel}
                            />
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<HiPlusCircle />}
                                onClick={() =>
                                    router.push('/karyawan/tambah')
                                }
                            >
                                Tambah Karyawan
                            </Button>
                        </div>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama, NIK, email, telepon... (tekan Enter)"
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit()
                        }}
                    />
                    <div className="w-44 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={
                                AKTIF_OPTIONS.find(
                                    (o) => o.value === aktifFilter,
                                ) ?? AKTIF_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setAktifFilter((opt as AktifOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                <KaryawanTable
                    data={list}
                    loading={loading}
                    pagingData={{
                        total,
                        pageIndex: currentPage,
                        pageSize,
                    }}
                    onPaginationChange={setCurrentPage}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                    onEdit={(item) =>
                        router.push(`/karyawan/${item.id_karyawan}/edit`)
                    }
                    onDelete={setDeleteTarget}
                />
            </Card>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Karyawan?"
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
                    Karyawan{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama_karyawan}&rdquo;
                    </span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat
                    dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default KaryawanPage
