'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import KategoriUmurFormPage from '@/components/kursus/kategori-umur/KategoriUmurFormPage'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { ICreateKategoriUmur, IUpdateKategoriUmur } from '@/@types/kursus.types'

const TambahKategoriUmurPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateKategoriUmur | IUpdateKategoriUmur) => {
        setSubmitting(true)
        try {
            await KategoriUmurService.create(payload as ICreateKategoriUmur)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.KATEGORI_UMUR)}
                />,
            )
            router.push(ROUTES.KURSUS_KELAS + '?tab=kategori-umur')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.KATEGORI_UMUR)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <KategoriUmurFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_KELAS + '?tab=kategori-umur')}
        />
    )
}

export default TambahKategoriUmurPage
