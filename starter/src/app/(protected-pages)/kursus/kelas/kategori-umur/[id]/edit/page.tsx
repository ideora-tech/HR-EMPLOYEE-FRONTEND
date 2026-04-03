'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import KategoriUmurFormPage from '@/components/kursus/kategori-umur/KategoriUmurFormPage'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IKategoriUmur, ICreateKategoriUmur, IUpdateKategoriUmur } from '@/@types/kursus.types'

const EditKategoriUmurPage = () => {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [editData, setEditData] = useState<IKategoriUmur | null>(null)
    const [loadingData, setLoadingData] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true)
            try {
                const res = await KategoriUmurService.getById(id)
                if (res.success) setEditData(res.data)
            } catch (err) {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push(ROUTES.KURSUS_KELAS + '?tab=kategori-umur')
            } finally {
                setLoadingData(false)
            }
        }
        if (id) fetchData()
    }, [id, router])

    const handleSubmit = async (payload: ICreateKategoriUmur | IUpdateKategoriUmur) => {
        setSubmitting(true)
        try {
            await KategoriUmurService.update(id, payload as IUpdateKategoriUmur)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.KATEGORI_UMUR)}
                />,
            )
            router.push(ROUTES.KURSUS_KELAS + '?tab=kategori-umur')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.KATEGORI_UMUR)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Memuat data...
            </div>
        )
    }

    return (
        <KategoriUmurFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_KELAS + '?tab=kategori-umur')}
        />
    )
}

export default EditKategoriUmurPage
