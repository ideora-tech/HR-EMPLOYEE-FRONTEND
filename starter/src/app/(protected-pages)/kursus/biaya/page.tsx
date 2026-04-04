'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Button,
    Card,
    Input,
    Select,
    Notification,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import BiayaTable from '@/components/kursus/biaya/BiayaTable'
import DiskonTable from '@/components/kursus/diskon/DiskonTable'
import DiskonForm from '@/components/kursus/diskon/DiskonForm'
import BiayaService from '@/services/kursus/biaya.service'
import DiskonService from '@/services/kursus/diskon.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IBiaya, IDiskon, ICreateDiskon, IUpdateDiskon } from '@/@types/kursus.types'

type ActiveTab = 'biaya' | 'diskon'
type AktifOption = { value: '' | '1' | '0'; label: string }

const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'biaya', label: 'Biaya' },
    { key: 'diskon', label: 'Diskon' },
]

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const BiayaPage = () => {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<ActiveTab>('biaya')
    const [submitting, setSubmitting] = useState(false)

    // ── Biaya state ──
    const [biayaList, setBiayaList] = useState<IBiaya[]>([])
    const [biayaLoading, setBiayaLoading] = useState(false)
    const [biayaSearchInput, setBiayaSearchInput] = useState('')
    const [biayaSearch, setBiayaSearch] = useState('')
    const [biayaAktif, setBiayaAktif] = useState<'' | '1' | '0'>('')
    const [biayaPage, setBiayaPage] = useState(1)
    const [biayaPageSize, setBiayaPageSize] = useState(10)
    const [biayaTotal, setBiayaTotal] = useState(0)
    const [biayaDeleteTarget, setBiayaDeleteTarget] = useState<IBiaya | null>(null)

    // ── Diskon state ──
    const [diskonList, setDiskonList] = useState<IDiskon[]>([])
    const [diskonLoading, setDiskonLoading] = useState(false)
    const [diskonSearchInput, setDiskonSearchInput] = useState('')
    const [diskonSearch, setDiskonSearch] = useState('')
    const [diskonAktif, setDiskonAktif] = useState<'' | '1' | '0'>('')
    const [diskonPage, setDiskonPage] = useState(1)
    const [diskonPageSize, setDiskonPageSize] = useState(10)
    const [diskonTotal, setDiskonTotal] = useState(0)
    const [diskonFormOpen, setDiskonFormOpen] = useState(false)
    const [diskonEditData, setDiskonEditData] = useState<IDiskon | null>(null)
    const [diskonDeleteTarget, setDiskonDeleteTarget] = useState<IDiskon | null>(null)

    // ── Fetch Biaya ──
    const fetchBiaya = useCallback(async () => {
        setBiayaLoading(true)
        try {
            const res = await BiayaService.getAll({
                search: biayaSearch || undefined,
                aktif: biayaAktif !== '' ? Number(biayaAktif) : undefined,
                page: biayaPage,
                limit: biayaPageSize,
            })
            if (res.success) {
                setBiayaList(res.data)
                setBiayaTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.BIAYA)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setBiayaLoading(false)
        }
    }, [biayaSearch, biayaAktif, biayaPage, biayaPageSize])

    useEffect(() => { fetchBiaya() }, [fetchBiaya])

    const handleBiayaDelete = async () => {
        if (!biayaDeleteTarget) return
        setSubmitting(true)
        try {
            await BiayaService.remove(biayaDeleteTarget.id_biaya)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.BIAYA)} />)
            setBiayaDeleteTarget(null)
            fetchBiaya()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.BIAYA)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    // ── Fetch Diskon ──
    const fetchDiskon = useCallback(async () => {
        setDiskonLoading(true)
        try {
            const res = await DiskonService.getAll({
                search: diskonSearch || undefined,
                aktif: diskonAktif !== '' ? Number(diskonAktif) : undefined,
                page: diskonPage,
                limit: diskonPageSize,
            })
            if (res.success) {
                setDiskonList(res.data)
                setDiskonTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.DISKON)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setDiskonLoading(false)
        }
    }, [diskonSearch, diskonAktif, diskonPage, diskonPageSize])

    useEffect(() => { fetchDiskon() }, [fetchDiskon])

    const handleDiskonSubmit = async (payload: ICreateDiskon | IUpdateDiskon) => {
        setSubmitting(true)
        try {
            if (diskonEditData) {
                await DiskonService.update(diskonEditData.id_diskon, payload as IUpdateDiskon)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.DISKON)} />)
            } else {
                await DiskonService.create(payload as ICreateDiskon)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.DISKON)} />)
            }
            setDiskonFormOpen(false)
            setDiskonEditData(null)
            fetchDiskon()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={diskonEditData ? MESSAGES.ERROR.UPDATE(ENTITY.DISKON) : MESSAGES.ERROR.CREATE(ENTITY.DISKON)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiskonDelete = async () => {
        if (!diskonDeleteTarget) return
        setSubmitting(true)
        try {
            await DiskonService.remove(diskonDeleteTarget.id_diskon)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.DISKON)} />)
            setDiskonDeleteTarget(null)
            fetchDiskon()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.DISKON)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddClick = () => {
        if (activeTab === 'biaya') {
            router.push(ROUTES.KURSUS_BIAYA_TAMBAH)
        } else {
            setDiskonEditData(null)
            setDiskonFormOpen(true)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <h4>Manajemen Biaya & Diskon</h4>
                    <Button
                        variant="solid"
                        size="sm"
                        customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                        icon={<HiPlusCircle />}
                        onClick={handleAddClick}
                    >
                        {activeTab === 'biaya' ? 'Tambah Biaya' : 'Tambah Diskon'}
                    </Button>
                </div>

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

                <div className="pt-3">
                    {/* Tab: Biaya */}
                    {activeTab === 'biaya' && (
                        <>
                            <div className="flex items-center gap-3 px-4 pb-3">
                                <Input
                                    className="flex-1"
                                    placeholder="Cari nama biaya... (tekan Enter)"
                                    suffix={
                                        biayaSearchInput ? (
                                            <HiOutlineX
                                                className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                                onClick={() => { setBiayaSearchInput(''); setBiayaSearch(''); setBiayaPage(1) }}
                                            />
                                        ) : (
                                            <HiOutlineSearch className="text-gray-400 text-lg" />
                                        )
                                    }
                                    value={biayaSearchInput}
                                    onChange={(e) => setBiayaSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { setBiayaSearch(biayaSearchInput); setBiayaPage(1) }
                                    }}
                                />
                                <Select<AktifOption>
                                    className="w-44"
                                    placeholder="Semua Status"
                                    options={AKTIF_OPTIONS}
                                    value={AKTIF_OPTIONS.find((o) => o.value === biayaAktif) ?? AKTIF_OPTIONS[0]}
                                    onChange={(opt) => { setBiayaAktif((opt as AktifOption).value); setBiayaPage(1) }}
                                />
                            </div>

                            <BiayaTable
                                data={biayaList}
                                loading={biayaLoading}
                                pagingData={{ total: biayaTotal, pageIndex: biayaPage, pageSize: biayaPageSize }}
                                onPaginationChange={setBiayaPage}
                                onSelectChange={(size) => { setBiayaPageSize(size); setBiayaPage(1) }}
                                onEdit={(item) => router.push(ROUTES.KURSUS_BIAYA_EDIT(item.id_biaya))}
                                onDelete={setBiayaDeleteTarget}
                            />
                        </>
                    )}

                    {/* Tab: Diskon */}
                    {activeTab === 'diskon' && (
                        <>
                            <div className="flex items-center gap-3 px-4 pb-3">
                                <Input
                                    className="flex-1"
                                    placeholder="Cari kode / nama diskon... (tekan Enter)"
                                    suffix={
                                        diskonSearchInput ? (
                                            <HiOutlineX
                                                className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                                onClick={() => { setDiskonSearchInput(''); setDiskonSearch(''); setDiskonPage(1) }}
                                            />
                                        ) : (
                                            <HiOutlineSearch className="text-gray-400 text-lg" />
                                        )
                                    }
                                    value={diskonSearchInput}
                                    onChange={(e) => setDiskonSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { setDiskonSearch(diskonSearchInput); setDiskonPage(1) }
                                    }}
                                />
                                <Select<AktifOption>
                                    className="w-44"
                                    placeholder="Semua Status"
                                    options={AKTIF_OPTIONS}
                                    value={AKTIF_OPTIONS.find((o) => o.value === diskonAktif) ?? AKTIF_OPTIONS[0]}
                                    onChange={(opt) => { setDiskonAktif((opt as AktifOption).value); setDiskonPage(1) }}
                                />
                            </div>

                            <DiskonTable
                                data={diskonList}
                                loading={diskonLoading}
                                pagingData={{ total: diskonTotal, pageIndex: diskonPage, pageSize: diskonPageSize }}
                                onPaginationChange={setDiskonPage}
                                onSelectChange={(size) => { setDiskonPageSize(size); setDiskonPage(1) }}
                                onEdit={(item) => { setDiskonEditData(item); setDiskonFormOpen(true) }}
                                onDelete={setDiskonDeleteTarget}
                            />
                        </>
                    )}
                </div>
            </Card>

            {/* Diskon Form Modal */}
            <DiskonForm
                open={diskonFormOpen}
                editData={diskonEditData}
                submitting={submitting}
                onClose={() => { setDiskonFormOpen(false); setDiskonEditData(null) }}
                onSubmit={handleDiskonSubmit}
            />

            {/* Confirm Delete Biaya */}
            <ConfirmDialog
                isOpen={!!biayaDeleteTarget}
                type="danger"
                title="Hapus Biaya"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setBiayaDeleteTarget(null)}
                onCancel={() => setBiayaDeleteTarget(null)}
                onConfirm={handleBiayaDelete}
            >
                <p className="text-sm">
                    Biaya{' '}
                    <span className="font-semibold">&ldquo;{biayaDeleteTarget?.nama_biaya}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>

            {/* Confirm Delete Diskon */}
            <ConfirmDialog
                isOpen={!!diskonDeleteTarget}
                type="danger"
                title="Hapus Diskon"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setDiskonDeleteTarget(null)}
                onCancel={() => setDiskonDeleteTarget(null)}
                onConfirm={handleDiskonDelete}
            >
                <p className="text-sm">
                    Diskon{' '}
                    <span className="font-semibold">&ldquo;{diskonDeleteTarget?.nama_diskon}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default BiayaPage

