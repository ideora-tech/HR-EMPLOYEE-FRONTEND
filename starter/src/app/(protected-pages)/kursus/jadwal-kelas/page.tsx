'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Card,
    Input,
    Select,
    Notification,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX, HiOutlineViewList, HiOutlineCalendar } from 'react-icons/hi'
import JadwalTable from '@/components/kursus/jadwal/JadwalTable'
import JadwalKalender from '@/components/kursus/jadwal/JadwalKalender'
import JadwalForm from '@/components/kursus/jadwal/JadwalForm'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import ProgramPengajaranService from '@/services/kursus/program-pengajaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IJadwalKelas,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
    IProgramPengajaran,
} from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const JadwalKelasPage = () => {
    const [list, setList] = useState<IJadwalKelas[]>([])
    const [programList, setProgramList] = useState<IProgramPengajaran[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [view, setView] = useState<'table' | 'kalender'>('table')
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<IJadwalKelas | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IJadwalKelas | null>(null)

    useEffect(() => {
        ProgramPengajaranService.getAll({ aktif: 1, limit: 100 })
            .then((res) => { if (res.success) setProgramList(res.data) })
            .catch(() => {})
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await JadwalKelasService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.JADWAL_KELAS)}>
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

    const handleViewChange = (v: 'table' | 'kalender') => {
        setView(v)
        if (v === 'kalender') {
            setPageSize(200)
            setCurrentPage(1)
        } else {
            setPageSize(10)
            setCurrentPage(1)
        }
    }

    const handleSearchSubmit = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }

    const handleSubmit = async (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await JadwalKelasService.update(editTarget.id_jadwal, payload as IUpdateJadwalKelas)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.JADWAL_KELAS)} />)
            } else {
                await JadwalKelasService.create(payload as ICreateJadwalKelas)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.JADWAL_KELAS)} />)
            }
            setFormOpen(false)
            setEditTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editTarget ? MESSAGES.ERROR.UPDATE(ENTITY.JADWAL_KELAS) : MESSAGES.ERROR.CREATE(ENTITY.JADWAL_KELAS)}
                >
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
            await JadwalKelasService.remove(deleteTarget.id_jadwal)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.JADWAL_KELAS)} />)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.JADWAL_KELAS)}>
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
                    content: <h4>Jadwal Kelas</h4>,
                    extra: (
                        <div className="flex items-center gap-2">
                            {/* View toggle */}
                            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <button
                                    type="button"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'table' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    onClick={() => handleViewChange('table')}
                                >
                                    <HiOutlineViewList className="text-base" />
                                    Tabel
                                </button>
                                <button
                                    type="button"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'kalender' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    onClick={() => handleViewChange('kalender')}
                                >
                                    <HiOutlineCalendar className="text-base" />
                                    Kalender
                                </button>
                            </div>
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<HiPlusCircle />}
                                onClick={() => { setEditTarget(null); setFormOpen(true) }}
                            >
                                Tambah Jadwal
                            </Button>
                        </div>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className={`flex items-center gap-3 px-4 pb-3 ${view === 'kalender' ? 'hidden' : ''}`}>
                    <Input
                        className="flex-1"
                        placeholder="Cari nama kelas, instruktur, lokasi... (tekan Enter)"
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
                    <div className="w-44 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                            onChange={(opt) => {
                                setAktifFilter((opt as AktifOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                {view === 'table' ? (
                    <JadwalTable
                        data={list}
                        loading={loading}
                        pagingData={{ total, pageIndex: currentPage, pageSize }}
                        onPaginationChange={setCurrentPage}
                        onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                        onEdit={(item) => { setEditTarget(item); setFormOpen(true) }}
                        onDelete={setDeleteTarget}
                    />
                ) : (
                    <div className="px-4 pb-4">
                        <JadwalKalender
                            data={list}
                            loading={loading}
                            onEdit={(item) => { setEditTarget(item); setFormOpen(true) }}
                            onDelete={setDeleteTarget}
                        />
                    </div>
                )}
            </Card>

            <JadwalForm
                open={formOpen}
                editData={editTarget}
                programList={programList}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditTarget(null) }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Jadwal?"
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
                    Jadwal{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default JadwalKelasPage
