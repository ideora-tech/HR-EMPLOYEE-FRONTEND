'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import KaryawanExitFormPage from '@/components/karyawan-exit/KaryawanExitFormPage'
import KaryawanExitService from '@/services/karyawan-exit.service'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICreateKaryawanExit, IUpdateKaryawanExit } from '@/@types/karyawan-exit.types'
import type { IKaryawan } from '@/@types/karyawan.types'

const TambahKaryawanExitPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [karyawanList, setKaryawanList] = useState<IKaryawan[]>([])

    useEffect(() => {
        KaryawanService.getAll({ aktif: 1, limit: 500 })
            .then((res) => {
                if (res.success) setKaryawanList(res.data)
            })
            .catch(() => {/* silently ignore */})
    }, [])

    const handleSubmit = async (payload: ICreateKaryawanExit | IUpdateKaryawanExit) => {
        setSubmitting(true)
        try {
            await KaryawanExitService.create(payload as ICreateKaryawanExit)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.KARYAWAN_EXIT)}
                />,
            )
            router.push('/karyawan-exit')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.KARYAWAN_EXIT)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <KaryawanExitFormPage
            submitting={submitting}
            karyawanList={karyawanList}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan-exit')}
        />
    )
}

export default TambahKaryawanExitPage
