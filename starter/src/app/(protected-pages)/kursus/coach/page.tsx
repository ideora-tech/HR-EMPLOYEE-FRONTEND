'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import CoachTable from '@/components/kursus/coach/CoachTable'
import CoachForm from '@/components/kursus/coach/CoachForm'
import CoachDetailDrawer from '@/components/kursus/coach/CoachDetailDrawer'
import AbsensiCoachTable from '@/components/kursus/absensi-coach/AbsensiCoachTable'
import CoachService from '@/services/kursus/coach.service'
import AbsensiCoachService from '@/services/kursus/absensi-coach.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICoachPublic, ICreateCoach, IUpdateCoach, IAbsensiCoachPublic } from '@/@types/kursus.types'

/* ─── types ──────────────────────────────────────────────── */

type ActiveTab = 'coach' | 'absensi'
type AktifOption = { value: '' | '1' | '0'; label: string }
type CoachOption = { value: string; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const ALL_COACH_OPTION: CoachOption = { value: '', label: 'Semua Coach' }

const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'coach', label: 'Data Coach' },
    { key: 'absensi', label: 'Absensi Coach' },
]

/* ─── page ───────────────────────────────────────────────── */

const CoachPage = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('coach')

    /* ── Data Coach state ─────────────────────────────────── */
    const [coachList, setCoachList] = useState<ICoachPublic[]>([])
    const [coachLoading, setCoachLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [coachPage, setCoachPage] = useState(1)
    const [coachPageSize, setCoachPageSize] = useState(10)
    const [coachTotal, setCoachTotal] = useState(0)
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ICoachPublic | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ICoachPublic | null>(null)
    const [detailTarget, setDetailTarget] = useState<ICoachPublic | null>(null)

    /* ── Absensi Coach state ──────────────────────────────── */
    const [absensiList, setAbsensiList] = useState<IAbsensiCoachPublic[]>([])
    const [absensiLoading, setAbsensiLoading] = useState(false)
    const [coachOptions, setCoachOptions] = useState<CoachOption[]>([ALL_COACH_OPTION])
    const [selectedCoachId, setSelectedCoachId] = useState('')
    const [absensiPage, setAbsensiPage] = useState(1)
    const [absensiPageSize, setAbsensiPageSize] = useState(10)
    const [absensiTotal, setAbsensiTotal] = useState(0)

    /* ── Fetch coach list (paginated) ─────────────────────── */
    const fetchCoachList = useCallback(async () => {
        setCoachLoading(true)
        try {
            const res = await CoachService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? (Number(aktifFilter) as 0 | 1) : undefined,
                page: coachPage,
                limit: coachPageSize,
            })
            if (res.success) {
                setCoachList(res.data)
                setCoachTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.COACH)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setCoachLoading(false)
        }
    }, [search, aktifFilter, coachPage, coachPageSize])

    /* ── Fetch all active coaches for dropdown ────────────── */
    useEffect(() => {
        const fetchAllCoaches = async () => {
            try {
                const res = await CoachService.getAll({ limit: 200, aktif: 1 })
                if (res.success) {
                    setCoachOptions([
                        ALL_COACH_OPTION,
                        ...res.data.map((c: ICoachPublic) => ({
                            value: c.id_coach,
                            label: c.nama_karyawan,
                        })),
                    ])
                }
            } catch {
                /* silent */
            }
        }
        fetchAllCoaches()
    }, [])

    /* ── Fetch absensi ────────────────────────────────────── */
    const fetchAbsensi = useCallback(async () => {
        setAbsensiLoading(true)
        try {
            const res = await AbsensiCoachService.getAll({
                page: absensiPage,
                limit: absensiPageSize,
                id_coach: selectedCoachId || undefined,
            })
            if (res.success) {
                setAbsensiList(res.data)
                setAbsensiTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data absensi coach">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setAbsensiLoading(false)
        }
    }, [selectedCoachId, absensiPage, absensiPageSize])

    useEffect(() => {
        fetchCoachList()
    }, [fetchCoachList])

    useEffect(() => {
        if (activeTab === 'absensi') fetchAbsensi()
    }, [activeTab, fetchAbsensi])

    /* ── Coach tab handlers ───────────────────────────────── */
    const handleSearchSubmit = () => { setSearch(searchInput); setCoachPage(1) }
    const handleSearchClear = () => { setSearchInput(''); setSearch(''); setCoachPage(1) }

    const handleOpenAdd = () => { setEditTarget(null); setFormOpen(true) }
    const handleOpenEdit = (row: ICoachPublic) => { setEditTarget(row); setFormOpen(true) }
    const handleFormClose = () => { setFormOpen(false); setEditTarget(null) }

    const handleSubmit = async (payload: ICreateCoach | IUpdateCoach) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await CoachService.update(editTarget.id_coach, payload as IUpdateCoach)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.COACH)} />)
            } else {
                await CoachService.create(payload as ICreateCoach)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.COACH)} />)
            }
            handleFormClose()
            fetchCoachList()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editTarget ? MESSAGES.ERROR.UPDATE(ENTITY.COACH) : MESSAGES.ERROR.CREATE(ENTITY.COACH)}
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
            await CoachService.remove(deleteTarget.id_coach)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.COACH)} />)
            setDeleteTarget(null)
            fetchCoachList()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.COACH)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    /* ── Render ───────────────────────────────────────────── */
    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <h4>Manajemen Coach</h4>
                    {activeTab === 'coach' && (
                        <Button
                            variant="solid"
                            size="sm"
                            customColorClass={() =>
                                'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                            }
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Tambah Coach
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-4 pt-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex gap-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={[
                                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab: Data Coach */}
                {activeTab === 'coach' && (
                    <div className="pt-3">
                        <div className="flex items-center gap-3 px-4 pb-3">
                            <Input
                                className="flex-1"
                                placeholder="Cari nama coach atau spesialisasi... (tekan Enter)"
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
                                        setCoachPage(1)
                                    }}
                                />
                            </div>
                        </div>

                        <CoachTable
                            data={coachList}
                            loading={coachLoading}
                            pagingData={{ total: coachTotal, pageIndex: coachPage, pageSize: coachPageSize }}
                            onPageChange={setCoachPage}
                            onPageSizeChange={(size) => { setCoachPageSize(size); setCoachPage(1) }}
                            onEdit={handleOpenEdit}
                            onDelete={setDeleteTarget}
                            onViewDetail={setDetailTarget}
                        />
                    </div>
                )}

                {/* Tab: Absensi Coach */}
                {activeTab === 'absensi' && (
                    <div className="pt-3">
                        <div className="flex items-center gap-3 px-4 pb-3">
                            <div className="w-64 shrink-0">
                                <Select<CoachOption>
                                    options={coachOptions}
                                    value={coachOptions.find((o) => o.value === selectedCoachId) ?? ALL_COACH_OPTION}
                                    onChange={(opt) => {
                                        setSelectedCoachId((opt as CoachOption | null)?.value ?? '')
                                        setAbsensiPage(1)
                                    }}
                                />
                            </div>
                        </div>

                        <AbsensiCoachTable
                            data={absensiList}
                            loading={absensiLoading}
                            pagingData={{ total: absensiTotal, pageIndex: absensiPage, pageSize: absensiPageSize }}
                            onPageChange={setAbsensiPage}
                            onPageSizeChange={(size) => { setAbsensiPageSize(size); setAbsensiPage(1) }}
                        />
                    </div>
                )}
            </Card>

            {/* Modals & drawers */}
            <CoachForm
                open={formOpen}
                editData={editTarget}
                submitting={submitting}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <CoachDetailDrawer
                open={!!detailTarget}
                data={detailTarget}
                onClose={() => setDetailTarget(null)}
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
                    Data coach{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama_karyawan}&rdquo;
                    </span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default CoachPage
