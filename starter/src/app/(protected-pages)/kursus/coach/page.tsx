'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import CoachTable from '@/components/kursus/coach/CoachTable'
import CoachFormDialog from '@/components/kursus/coach/CoachFormDialog'
import CoachService from '@/services/kursus/coach.service'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import type { KaryawanOption } from '@/components/kursus/coach/CoachFormDialog'
import type { ICoachPublic, ICreateCoach, IUpdateCoach } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const CoachPage = () => {
    const [coachList, setCoachList] = useState<ICoachPublic[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([])
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ICoachPublic | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ICoachPublic | null>(null)

    useEffect(() => {
        const fetchKaryawan = async () => {
            try {
                const res = await KaryawanService.getAll({ aktif: 1, limit: 200 })
                if (res.success) {
                    setKaryawanOptions(
                        res.data.map((k) => ({ value: k.id_karyawan, label: k.nama_karyawan })),
                    )
                }
            } catch {
                /* silent — dropdown karyawan kosong, error muncul saat submit */
            }
        }
        fetchKaryawan()
    }, [])

    const fetchCoach = useCallback(async () => {
        setLoading(true)
        try {
            const res = await CoachService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? (Number(aktifFilter) as 0 | 1) : undefined,
                page,
                limit: pageSize,
            })
            if (res.success) {
                setCoachList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data coach">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, page, pageSize])

    useEffect(() => {
        fetchCoach()
    }, [fetchCoach])

    const handleSearchSubmit = () => { setSearch(searchInput); setPage(1) }
    const handleSearchClear = () => { setSearchInput(''); setSearch(''); setPage(1) }

    const closeForm = () => { setFormOpen(false); setEditTarget(null) }

    const handleCreate = async (payload: ICreateCoach) => {
        setSubmitting(true)
        try {
            await CoachService.create(payload)
            toast.push(<Notification type="success" title="Coach berhasil didaftarkan" />)
            closeForm()
            fetchCoach()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal mendaftarkan coach">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async (id: string, payload: IUpdateCoach) => {
        setSubmitting(true)
        try {
            await CoachService.update(id, payload)
            toast.push(<Notification type="success" title="Profil coach berhasil diperbarui" />)
            closeForm()
            fetchCoach()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memperbarui coach">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await CoachService.remove(deleteTarget.id_coach)
            toast.push(<Notification type="success" title="Coach berhasil dihapus" />)
            setDeleteTarget(null)
            fetchCoach()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menghapus coach">
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
                    content: <h4>Data Coach</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                            icon={<HiPlusCircle />}
                            onClick={() => { setEditTarget(null); setFormOpen(true) }}
                        >
                            Jadikan Coach
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama coach... (tekan Enter)"
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
                    <div className="w-40 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                            onChange={(opt) => { setAktifFilter((opt as AktifOption).value); setPage(1) }}
                        />
                    </div>
                </div>

                <CoachTable
                    data={coachList}
                    loading={loading}
                    pagingData={{ total, pageIndex: page, pageSize }}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                    onEdit={(row) => { setEditTarget(row); setFormOpen(true) }}
                    onDelete={setDeleteTarget}
                />
            </Card>

            <CoachFormDialog
                open={formOpen}
                editData={editTarget}
                karyawanOptions={karyawanOptions}
                submitting={submitting}
                onClose={closeForm}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Coach?"
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
                    Profil coach{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama_karyawan}&rdquo;
                    </span>{' '}
                    akan dihapus. Coach tidak bisa lagi login di aplikasi mobile, tapi bisa
                    didaftarkan ulang kapan saja.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default CoachPage
