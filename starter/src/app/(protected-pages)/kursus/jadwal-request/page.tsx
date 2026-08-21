'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Select, Input, Button, Notification, toast } from '@/components/ui'
import JadwalRequestTable from '@/components/kursus/jadwal-request/JadwalRequestTable'
import ApproveRejectModal from '@/components/kursus/jadwal-request/ApproveRejectModal'
import JadwalRequestService from '@/services/kursus/jadwal-request.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IJadwalRequestPublic } from '@/@types/kursus.types'

type StatusValue = '' | '1' | '2' | '3' | '4'
type StatusOption = { value: StatusValue; label: string }

const STATUS_OPTIONS: StatusOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Menunggu' },
    { value: '2', label: 'Disetujui' },
    { value: '3', label: 'Ditolak' },
    { value: '4', label: 'Dibatalkan' },
]

const JadwalRequestPage = () => {
    const [list, setList] = useState<IJadwalRequestPublic[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [statusFilter, setStatusFilter] = useState<StatusValue>('')
    const [dari, setDari] = useState('')
    const [sampai, setSampai] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'approve' | 'reject' | null>(null)
    const [modalTarget, setModalTarget] = useState<IJadwalRequestPublic | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await JadwalRequestService.getAll({
                status:
                    statusFilter !== ''
                        ? (Number(statusFilter) as 1 | 2 | 3 | 4)
                        : undefined,
                dari: dari || undefined,
                sampai: sampai || undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data Request Jadwal">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [statusFilter, dari, sampai, currentPage, pageSize])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleApprove = (row: IJadwalRequestPublic) => {
        setModalTarget(row)
        setModalMode('approve')
        setModalOpen(true)
    }

    const handleReject = (row: IJadwalRequestPublic) => {
        setModalTarget(row)
        setModalMode('reject')
        setModalOpen(true)
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setModalMode(null)
        setModalTarget(null)
    }

    const handleConfirm = async (catatan?: string) => {
        if (!modalTarget || !modalMode) return
        const newStatus = modalMode === 'approve' ? 2 : 3
        setSubmitting(true)
        try {
            await JadwalRequestService.handleApproval(modalTarget.id_request, {
                status: newStatus as 2 | 3,
                catatan_admin: catatan,
            })
            toast.push(
                <Notification
                    type="success"
                    title={
                        modalMode === 'approve'
                            ? 'Request berhasil disetujui'
                            : 'Request berhasil ditolak'
                    }
                />,
            )
            handleModalClose()
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={
                        modalMode === 'approve'
                            ? 'Gagal menyetujui request'
                            : 'Gagal menolak request'
                    }
                >
                    {parseApiError(err)}
                </Notification>,
            )
            handleModalClose()
            fetchData()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <h4>Manajemen Jadwal Request</h4>
                </div>

                <div className="flex flex-wrap items-end gap-3 px-4 pb-3">
                    <div className="w-48 shrink-0">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Status
                        </label>
                        <Select<StatusOption>
                            options={STATUS_OPTIONS}
                            value={
                                STATUS_OPTIONS.find((o) => o.value === statusFilter) ??
                                STATUS_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setStatusFilter((opt as StatusOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    <div className="w-44 shrink-0">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Pertemuan Dari
                        </label>
                        <Input
                            type="date"
                            value={dari}
                            onChange={(e) => {
                                setDari(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    <div className="w-44 shrink-0">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Pertemuan Sampai
                        </label>
                        <Input
                            type="date"
                            value={sampai}
                            onChange={(e) => {
                                setSampai(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    {(dari !== '' || sampai !== '') && (
                        <Button
                            size="sm"
                            variant="plain"
                            onClick={() => {
                                setDari('')
                                setSampai('')
                                setCurrentPage(1)
                            }}
                        >
                            Reset Tanggal
                        </Button>
                    )}
                </div>

                <JadwalRequestTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            </Card>

            <ApproveRejectModal
                open={modalOpen}
                mode={modalMode}
                target={modalTarget}
                submitting={submitting}
                onClose={handleModalClose}
                onConfirm={handleConfirm}
            />
        </div>
    )
}

export default JadwalRequestPage
