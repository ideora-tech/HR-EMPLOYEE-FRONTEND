'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import KaryawanExitFormPage from '@/components/karyawan-exit/KaryawanExitFormPage'
import KaryawanExitService from '@/services/karyawan-exit.service'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IKaryawanExit,
    ICreateKaryawanExit,
    IUpdateKaryawanExit,
} from '@/@types/karyawan-exit.types'
import type { IKaryawan } from '@/@types/karyawan.types'

const EditKaryawanExitPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IKaryawanExit | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [karyawanList, setKaryawanList] = useState<IKaryawan[]>([])

    useEffect(() => {
        if (!id) return
        Promise.allSettled([
            KaryawanExitService.getById(id),
            KaryawanService.getAll({ aktif: 1, limit: 500 }),
        ]).then(([exitRes, karyawanRes]) => {
            if (exitRes.status === 'fulfilled' && exitRes.value.success) {
                setEditData(exitRes.value.data)
            } else {
                toast.push(
                    <Notification
                        type="danger"
                        title="Gagal memuat data exit karyawan"
                    />,
                )
                router.push('/karyawan-exit')
                return
            }
            if (karyawanRes.status === 'fulfilled' && karyawanRes.value.success)
                setKaryawanList(karyawanRes.value.data)
            setLoading(false)
        })
    }, [id, router])

    const handleSubmit = async (payload: ICreateKaryawanExit | IUpdateKaryawanExit) => {
        if (!id) return
        setSubmitting(true)
        try {
            await KaryawanExitService.update(id, payload as IUpdateKaryawanExit)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.KARYAWAN_EXIT)}
                />,
            )
            router.push('/karyawan-exit')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.KARYAWAN_EXIT)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-60">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <KaryawanExitFormPage
            editData={editData}
            submitting={submitting}
            karyawanList={karyawanList}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan-exit')}
        />
    )
}

export default EditKaryawanExitPage
