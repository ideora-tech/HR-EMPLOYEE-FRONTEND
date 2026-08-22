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

    const handleSubmit = async (payload: ICreateJadwalKelas[] | IUpdateJadwalKelas) => {
        // Halaman ini hanya pernah render JadwalFormPage tanpa editData, sehingga
        // JadwalFormPage selalu mengirim array (satu ICreateJadwalKelas per hari terpilih).
        const items = payload as ICreateJadwalKelas[]
        const failures: { hari: string; error: string }[] = []
        let successCount = 0

        setSubmitting(true)
        try {
            for (const item of items) {
                try {
                    await JadwalKelasService.create(item)
                    successCount++
                } catch (err) {
                    failures.push({ hari: item.hari, error: parseApiError(err) })
                }
            }

            if (failures.length === 0) {
                toast.push(
                    <Notification type="success" title={`${successCount} jadwal berhasil dibuat`} />,
                )
                router.push(ROUTES.KURSUS_JADWAL)
                return
            }

            const failureText = failures.map((f) => `${f.hari} — ${f.error}`).join('; ')

            if (successCount > 0) {
                toast.push(
                    <Notification
                        type="warning"
                        title={`${successCount} jadwal dibuat. Gagal: ${failureText}`}
                    />,
                )
                router.push(ROUTES.KURSUS_JADWAL)
            } else {
                toast.push(
                    <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.JADWAL_KELAS)}>
                        {failureText}
                    </Notification>,
                )
            }
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
