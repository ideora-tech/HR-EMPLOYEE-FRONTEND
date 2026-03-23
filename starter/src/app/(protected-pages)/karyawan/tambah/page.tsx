'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import KaryawanFormPage from '@/components/karyawan/KaryawanFormPage'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICreateKaryawan, IUpdateKaryawan } from '@/@types/karyawan.types'

const TambahKaryawanPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (
        payload: ICreateKaryawan | IUpdateKaryawan,
    ) => {
        setSubmitting(true)
        try {
            await KaryawanService.create(payload as ICreateKaryawan)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.KARYAWAN)}
                />,
            )
            router.push('/karyawan')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.KARYAWAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <KaryawanFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan')}
        />
    )
}

export default TambahKaryawanPage
