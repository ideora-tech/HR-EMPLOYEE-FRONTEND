'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Select, Notification, toast } from '@/components/ui'
import AbsensiCoachTable from '@/components/kursus/absensi-coach/AbsensiCoachTable'
import AbsensiCoachService from '@/services/kursus/absensi-coach.service'
import CoachService from '@/services/kursus/coach.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IAbsensiCoachPublic, ICoachPublic } from '@/@types/kursus.types'

type CoachOption = { value: string; label: string }

const ALL_COACH_OPTION: CoachOption = { value: '', label: 'Semua Coach' }

const AbsensiCoachPage = () => {
    const [list, setList] = useState<IAbsensiCoachPublic[]>([])
    const [loading, setLoading] = useState(false)

    const [coachOptions, setCoachOptions] = useState<CoachOption[]>([ALL_COACH_OPTION])
    const [selectedCoachId, setSelectedCoachId] = useState<string>('')

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const res = await CoachService.getAll({ limit: 200, aktif: 1 })
                if (res.success) {
                    const options: CoachOption[] = res.data.map((c: ICoachPublic) => ({
                        value: c.id_coach,
                        label: c.nama_karyawan,
                    }))
                    setCoachOptions([ALL_COACH_OPTION, ...options])
                }
            } catch (err) {
                toast.push(
                    <Notification type="danger" title="Gagal memuat daftar coach">
                        {parseApiError(err)}
                    </Notification>,
                )
            }
        }
        fetchCoaches()
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await AbsensiCoachService.getAll({
                page: currentPage,
                limit: pageSize,
                id_coach: selectedCoachId || undefined,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data absensi coach">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [selectedCoachId, currentPage, pageSize])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCoachChange = useCallback((opt: CoachOption | null) => {
        setSelectedCoachId(opt?.value ?? '')
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <h4>Riwayat Absensi Coach</h4>
                </div>

                <div className="flex items-center gap-3 px-4 pb-3">
                    <div className="w-64 shrink-0">
                        <Select<CoachOption>
                            options={coachOptions}
                            value={coachOptions.find((o) => o.value === selectedCoachId) ?? ALL_COACH_OPTION}
                            onChange={(opt) => handleCoachChange(opt as CoachOption | null)}
                        />
                    </div>
                </div>

                <AbsensiCoachTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </Card>
        </div>
    )
}

export default AbsensiCoachPage
