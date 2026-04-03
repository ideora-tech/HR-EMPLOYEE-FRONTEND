'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import PendaftaranFormPage from '@/components/kursus/siswa/PendaftaranFormPage'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { ROUTES } from '@/constants/route.constant'
import type { IDaftarSiswa } from '@/@types/kursus.types'

const DaftarSiswaPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: IDaftarSiswa) => {
        setSubmitting(true)
        try {
            const res = await SiswaService.daftar(payload)
            if (res.success) {
                const info = res.data
                const pesan = info.diskon_diterapkan
                    ? `Siswa berhasil didaftarkan. Total tagihan: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(info.total_setelah_diskon)} (hemat dari ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(info.total_sebelum_diskon)})`
                    : `Siswa berhasil didaftarkan. Total tagihan: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(info.total_sebelum_diskon)}`

                toast.push(
                    <Notification type="success" title="Pendaftaran Berhasil">
                        {pesan}
                    </Notification>,
                )
                router.push(ROUTES.KURSUS_SISWA)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Pendaftaran Gagal">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <PendaftaranFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_SISWA)}
        />
    )
}

export default DaftarSiswaPage
