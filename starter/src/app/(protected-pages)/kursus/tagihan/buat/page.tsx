'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import TagihanFormPage from '@/components/kursus/tagihan/TagihanFormPage'
import TagihanService from '@/services/kursus/tagihan.service'
import { parseApiError } from '@/utils/parseApiError'
import { ROUTES } from '@/constants/route.constant'
import type { ICreateTagihanBulk } from '@/@types/kursus.types'

const BuatTagihanPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateTagihanBulk) => {
        setSubmitting(true)
        try {
            await TagihanService.createBulk(payload)
            toast.push(<Notification type="success" title="Tagihan berhasil dibuat" />)
            router.push(ROUTES.KURSUS_TAGIHAN)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal membuat tagihan">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <TagihanFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_TAGIHAN)}
        />
    )
}

export default BuatTagihanPage
