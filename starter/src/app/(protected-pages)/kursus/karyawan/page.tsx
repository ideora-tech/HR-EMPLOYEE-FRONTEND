'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import KaryawanKursusTable from '@/components/kursus/karyawan/KaryawanKursusTable'
import KaryawanService from '@/services/karyawan.service'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import { parseApiError } from '@/utils/parseApiError'
import type { IKaryawan } from '@/@types/karyawan.types'
import type { IJabatan } from '@/@types/organisasi.types'
import type { ApiPaginatedResponse } from '@/@types/karyawan.types'

type AktifOption = { value: '' | '1' | '0'; label: string }
type JabatanOption = { value: string; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const ALL_JABATAN: JabatanOption = { value: '', label: 'Semua Jabatan' }

const KaryawanKursusPage = () => {
    const router = useRouter()

    const [karyawanList, setKaryawanList] = useState<IKaryawan[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [jabatanFilter, setJabatanFilter] = useState('')
    const [jabatanOptions, setJabatanOptions] = useState<JabatanOption[]>([ALL_JABATAN])

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<IKaryawan | null>(null)

    useEffect(() => {
        const fetchJabatan = async () => {
            try {
                const res = await ApiService.fetchDataWithAxios<ApiPaginatedResponse<IJabatan>>({
                    url: `${API_ENDPOINTS.ORGANISASI.JABATAN.BASE}?limit=200`,
                    method: 'GET',
                })
                if (res.success) {
                    setJabatanOptions([
                        ALL_JABATAN,
                        ...res.data.map((j) => ({ value: j.id_jabatan, label: j.nama_jabatan })),
                    ])
                }
            } catch {
                /* silent */
            }
        }
        fetchJabatan()
    }, [])

    const fetchKaryawan = useCallback(async () => {
        setLoading(true)
        try {
            const res = await KaryawanService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? Number(aktifFilter) : undefined,
                page,
                limit: pageSize,
            })
            if (res.success) {
                setKaryawanList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data karyawan">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, page, pageSize])

    useEffect(() => {
        fetchKaryawan()
    }, [fetchKaryawan])

    const filteredList = useMemo(() => {
        if (!jabatanFilter) return karyawanList
        return karyawanList.filter((k) => k.jabatan?.id_jabatan === jabatanFilter)
    }, [karyawanList, jabatanFilter])

    const handleSearchSubmit = () => { setSearch(searchInput); setPage(1) }
    const handleSearchClear = () => { setSearchInput(''); setSearch(''); setPage(1) }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await KaryawanService.remove(deleteTarget.id_karyawan)
            toast.push(<Notification type="success" title="Karyawan berhasil dihapus" />)
            setDeleteTarget(null)
            fetchKaryawan()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menghapus karyawan">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Data Karyawan</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                            icon={<HiPlusCircle />}
                            onClick={() => router.push('/kursus/karyawan/tambah')}
                        >
                            Tambah Karyawan
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1 w-full"
                        placeholder="Cari nama atau email... (tekan Enter)"
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
                    <div className="w-full sm:w-40 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                            onChange={(opt) => { setAktifFilter((opt as AktifOption).value); setPage(1) }}
                        />
                    </div>
                    <div className="w-full sm:w-48 shrink-0">
                        <Select<JabatanOption>
                            options={jabatanOptions}
                            value={jabatanOptions.find((o) => o.value === jabatanFilter) ?? ALL_JABATAN}
                            onChange={(opt) => setJabatanFilter((opt as JabatanOption).value)}
                        />
                    </div>
                </div>

                <KaryawanKursusTable
                    data={filteredList}
                    loading={loading}
                    pagingData={{ total, pageIndex: page, pageSize }}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                    onEdit={(row) => router.push(`/kursus/karyawan/${row.id_karyawan}/edit`)}
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
                    Data karyawan{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama_karyawan}&rdquo;
                    </span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default KaryawanKursusPage
