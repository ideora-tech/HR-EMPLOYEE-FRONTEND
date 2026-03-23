'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import DaftarFormPage from '@/components/kursus/daftar-kelas/DaftarFormPage'
import DaftarKelasService from '@/services/kursus/daftar-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IDaftarKelas, ICreateDaftarKelas, IUpdateDaftarKelas } from '@/@types/kursus.types'

const EditDaftarSiswaPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IDaftarKelas | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        DaftarKelasService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data pendaftaran">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/kursus/daftar-kelas')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (payload: ICreateDaftarKelas | IUpdateDaftarKelas) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await DaftarKelasService.update(editData.id_daftar, payload as IUpdateDaftarKelas)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.DAFTAR_KELAS)}
                />,
            )
            router.push('/kursus/daftar-kelas')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.DAFTAR_KELAS)}
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
        <DaftarFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/kursus/daftar-kelas')}
        />
    )
}

export default EditDaftarSiswaPage
