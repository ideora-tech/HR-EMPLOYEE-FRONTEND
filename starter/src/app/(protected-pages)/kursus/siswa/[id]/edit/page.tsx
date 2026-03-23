'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import SiswaFormPage from '@/components/kursus/siswa/SiswaFormPage'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ISiswa, IUpdateSiswa } from '@/@types/kursus.types'

const EditSiswaPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<ISiswa | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        SiswaService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data siswa">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/kursus/siswa')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (payload: IUpdateSiswa) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await SiswaService.update(editData.id_siswa, payload)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.SISWA)}
                />,
            )
            router.push('/kursus/siswa')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.SISWA)}
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
        <SiswaFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/kursus/siswa')}
        />
    )
}

export default EditSiswaPage
