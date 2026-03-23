'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import ProgramPengajaranFormPage from '@/components/kursus/program-pengajaran/ProgramPengajaranFormPage'
import ProgramPengajaranService from '@/services/kursus/program-pengajaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IProgramPengajaran, IUpdateProgramPengajaran } from '@/@types/kursus.types'

const EditProgramPengajaranPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IProgramPengajaran | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        ProgramPengajaranService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data program pengajaran">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/kursus/program-pengajaran')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (payload: IUpdateProgramPengajaran) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await ProgramPengajaranService.update(editData.id_program, payload)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.PROGRAM_PENGAJARAN)}
                />,
            )
            router.push('/kursus/program-pengajaran')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.PROGRAM_PENGAJARAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Spinner size={36} />
            </div>
        )
    }

    if (!editData) return null

    return (
        <ProgramPengajaranFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/kursus/program-pengajaran')}
        />
    )
}

export default EditProgramPengajaranPage
