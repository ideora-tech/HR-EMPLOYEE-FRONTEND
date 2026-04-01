'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import BiayaFormPage from '@/components/kursus/biaya/BiayaFormPage'
import BiayaService from '@/services/kursus/biaya.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IBiaya, IUpdateBiaya } from '@/@types/kursus.types'

const EditBiayaPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IBiaya | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        BiayaService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data biaya">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push(ROUTES.KURSUS_BIAYA)
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (payload: IUpdateBiaya) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await BiayaService.update(editData.id_biaya, payload)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.BIAYA)} />,
            )
            router.push(ROUTES.KURSUS_BIAYA)
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.UPDATE(ENTITY.BIAYA)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <BiayaFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_BIAYA)}
        />
    )
}

export default EditBiayaPage
