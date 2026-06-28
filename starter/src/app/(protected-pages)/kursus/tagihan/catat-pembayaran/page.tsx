'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import PembayaranFormPage from '@/components/kursus/pembayaran/PembayaranFormPage'
import PembayaranService from '@/services/kursus/pembayaran.service'
import TagihanService from '@/services/kursus/tagihan.service'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { ICreatePembayaran } from '@/@types/kursus.types'

const CatatPembayaranPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreatePembayaran) => {
        setSubmitting(true)
        try {
            const res = await PembayaranService.create(payload)

            // Upload bukti bayar jika user memilih file
            if (payload.bukti_bayar && res.data?.id_pembayaran) {
                try {
                    await PembayaranService.uploadBukti(res.data.id_pembayaran, payload.bukti_bayar)
                } catch {
                    // Pembayaran sudah tercatat — bukti bayar gagal tidak batalkan pembayaran
                    toast.push(
                        <Notification type="warning" title="Pembayaran tercatat, tapi bukti bayar gagal diupload. Silakan upload ulang." />,
                    )
                }
            }

            // Jika tagihan sudah LUNAS, update status_pendaftaran siswa menjadi SELESAI
            try {
                const tagihanRes = await TagihanService.getById(payload.id_tagihan)
                if (tagihanRes.success && tagihanRes.data.status === 3) {
                    await SiswaService.update(tagihanRes.data.id_siswa, { status_pendaftaran: 3 })
                }
            } catch {
                // silent — jangan blokir alur pembayaran yang sudah sukses
            }

            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.PEMBAYARAN)} />,
            )
            router.push(ROUTES.KURSUS_TAGIHAN)
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.PEMBAYARAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return <PembayaranFormPage submitting={submitting} onSubmit={handleSubmit} />
}

export default CatatPembayaranPage
