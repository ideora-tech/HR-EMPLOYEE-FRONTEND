'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import PerusahaanFormPage from '@/components/perusahaan/PerusahaanFormPage'
import MataUangService from '@/services/mata-uang.service'
import PerusahaanService from '@/services/perusahaan.service'
import ZonaWaktuService from '@/services/zona-waktu.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IMataUang,
    IPerusahaan,
    IPerusahaanCreate,
    IPerusahaanUpdate,
    IZonaWaktu,
} from '@/@types/perusahaan.types'

const EditPerusahaanPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IPerusahaan | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [zonaWaktuList, setZonaWaktuList] = useState<IZonaWaktu[]>([])
    const [mataUangList, setMataUangList] = useState<IMataUang[]>([])

    useEffect(() => {
        if (!id) return
        Promise.allSettled([
            PerusahaanService.getById(id),
            ZonaWaktuService.getAll(),
            MataUangService.getAll(),
        ])
            .then(([perusahaanRes, zonaRes, mataRes]) => {
                if (
                    perusahaanRes.status === 'fulfilled' &&
                    perusahaanRes.value.success
                ) {
                    setEditData(perusahaanRes.value.data)
                } else {
                    toast.push(
                        <Notification
                            type="danger"
                            title="Gagal memuat data perusahaan"
                        />,
                    )
                    router.push('/perusahaan')
                    return
                }

                if (zonaRes.status === 'fulfilled' && zonaRes.value.data) {
                    setZonaWaktuList(zonaRes.value.data)
                }
                if (mataRes.status === 'fulfilled' && mataRes.value.data) {
                    setMataUangList(mataRes.value.data)
                }
            })
            .catch((err) => {
                toast.push(
                    <Notification
                        type="danger"
                        title="Gagal memuat data perusahaan"
                    >
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/perusahaan')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (
        payload: IPerusahaanCreate | IPerusahaanUpdate,
    ) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await PerusahaanService.update(
                editData.id_perusahaan,
                payload as IPerusahaanUpdate,
            )
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.PERUSAHAAN)}
                />,
            )
            router.push('/perusahaan')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.PERUSAHAAN)}
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
            <div className="flex justify-center items-center py-24">
                <Spinner size={36} />
            </div>
        )
    }

    if (!editData) return null

    return (
        <PerusahaanFormPage
            editData={editData}
            submitting={submitting}
            zonaWaktuList={zonaWaktuList}
            mataUangList={mataUangList}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/perusahaan')}
        />
    )
}

export default EditPerusahaanPage
