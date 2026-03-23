'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import KaryawanFormPage from '@/components/karyawan/KaryawanFormPage'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IKaryawan,
    ICreateKaryawan,
    IUpdateKaryawan,
} from '@/@types/karyawan.types'

const EditKaryawanPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IKaryawan | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        KaryawanService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification
                        type="danger"
                        title="Gagal memuat data karyawan"
                    >
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/karyawan')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (
        payload: ICreateKaryawan | IUpdateKaryawan,
    ) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await KaryawanService.update(
                editData.id_karyawan,
                payload as IUpdateKaryawan,
            )
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.KARYAWAN)}
                />,
            )
            router.push('/karyawan')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.KARYAWAN)}
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
        <KaryawanFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan')}
        />
    )
}

export default EditKaryawanPage
