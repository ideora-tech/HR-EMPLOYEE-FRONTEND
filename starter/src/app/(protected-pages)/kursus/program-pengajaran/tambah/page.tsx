'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import ProgramPengajaranFormPage from '@/components/kursus/program-pengajaran/ProgramPengajaranFormPage'
import ProgramPengajaranService from '@/services/kursus/program-pengajaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICreateProgramPengajaran, IUpdateProgramPengajaran } from '@/@types/kursus.types'

const TambahProgramPengajaranPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateProgramPengajaran | IUpdateProgramPengajaran) => {
        setSubmitting(true)
        try {
            await ProgramPengajaranService.create(payload as ICreateProgramPengajaran)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.PROGRAM_PENGAJARAN)}
                />,
            )
            router.push('/kursus/program-pengajaran')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.PROGRAM_PENGAJARAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ProgramPengajaranFormPage
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/kursus/program-pengajaran')}
        />
    )
}

export default TambahProgramPengajaranPage
