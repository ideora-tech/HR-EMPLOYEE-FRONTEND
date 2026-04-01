'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import BiayaFormPage from '@/components/kursus/biaya/BiayaFormPage'
import BiayaService from '@/services/kursus/biaya.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { ICreateBiaya, IUpdateBiaya } from '@/@types/kursus.types'

const TambahBiayaPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateBiaya | IUpdateBiaya) => {
        setSubmitting(true)
        try {
            await BiayaService.create(payload as ICreateBiaya)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.BIAYA)} />,
            )
            router.push(ROUTES.KURSUS_BIAYA)
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.BIAYA)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <BiayaFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_BIAYA)}
        />
    )
}

export default TambahBiayaPage
