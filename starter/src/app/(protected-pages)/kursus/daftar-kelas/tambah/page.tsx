'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import DaftarFormPage from '@/components/kursus/daftar-kelas/DaftarFormPage'
import DaftarKelasService from '@/services/kursus/daftar-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICreateDaftarKelas, IUpdateDaftarKelas } from '@/@types/kursus.types'

const TambahDaftarSiswaPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateDaftarKelas | IUpdateDaftarKelas) => {
        setSubmitting(true)
        try {
            await DaftarKelasService.create(payload as ICreateDaftarKelas)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.DAFTAR_KELAS)}
                />,
            )
            router.push('/kursus/daftar-kelas')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.DAFTAR_KELAS)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <DaftarFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/kursus/daftar-kelas')}
        />
    )
}

export default TambahDaftarSiswaPage
