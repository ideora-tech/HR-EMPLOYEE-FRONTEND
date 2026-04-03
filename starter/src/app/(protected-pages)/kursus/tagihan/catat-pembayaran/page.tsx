'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import PembayaranFormPage from '@/components/kursus/pembayaran/PembayaranFormPage'
import PembayaranService from '@/services/kursus/pembayaran.service'
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
            await PembayaranService.create(payload)
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
