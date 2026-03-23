'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import SiswaFormPage from '@/components/kursus/siswa/SiswaFormPage'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICreateSiswa, IUpdateSiswa } from '@/@types/kursus.types'

const TambahSiswaPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateSiswa | IUpdateSiswa) => {
        setSubmitting(true)
        try {
            await SiswaService.create(payload as ICreateSiswa)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.SISWA)}
                />,
            )
            router.push('/kursus/siswa')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.SISWA)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <SiswaFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/kursus/siswa')}
        />
    )
}

export default TambahSiswaPage
