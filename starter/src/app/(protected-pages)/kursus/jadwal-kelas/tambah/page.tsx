'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import JadwalFormPage from '@/components/kursus/jadwal/JadwalFormPage'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { ICreateJadwalKelas, IUpdateJadwalKelas } from '@/@types/kursus.types'

const TambahJadwalKelasPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => {
        setSubmitting(true)
        try {
            await JadwalKelasService.create(payload as ICreateJadwalKelas)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.JADWAL_KELAS)} />,
            )
            router.push(ROUTES.KURSUS_JADWAL)
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.JADWAL_KELAS)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <JadwalFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_JADWAL)}
        />
    )
}

export default TambahJadwalKelasPage
