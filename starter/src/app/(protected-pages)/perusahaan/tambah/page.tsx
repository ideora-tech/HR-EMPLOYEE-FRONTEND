'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import PerusahaanFormPage from '@/components/perusahaan/PerusahaanFormPage'
import MataUangService from '@/services/mata-uang.service'
import PerusahaanService from '@/services/perusahaan.service'
import ZonaWaktuService from '@/services/zona-waktu.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IMataUang,
    IPerusahaanCreate,
    IPerusahaanUpdate,
    IZonaWaktu,
} from '@/@types/perusahaan.types'

const TambahPerusahaanPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [zonaWaktuList, setZonaWaktuList] = useState<IZonaWaktu[]>([])
    const [mataUangList, setMataUangList] = useState<IMataUang[]>([])

    useEffect(() => {
        Promise.allSettled([
            ZonaWaktuService.getAll(),
            MataUangService.getAll(),
        ]).then(([zonaRes, mataRes]) => {
            if (zonaRes.status === 'fulfilled' && zonaRes.value.data) {
                setZonaWaktuList(zonaRes.value.data)
            }
            if (mataRes.status === 'fulfilled' && mataRes.value.data) {
                setMataUangList(mataRes.value.data)
            }
        })
    }, [])

    const handleSubmit = async (payload: IPerusahaanCreate | IPerusahaanUpdate) => {
        setSubmitting(true)
        try {
            await PerusahaanService.create(payload as IPerusahaanCreate)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.CREATED(ENTITY.PERUSAHAAN)}
                />,
            )
            router.push('/perusahaan')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.CREATE(ENTITY.PERUSAHAAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <PerusahaanFormPage
            submitting={submitting}
            zonaWaktuList={zonaWaktuList}
            mataUangList={mataUangList}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/perusahaan')}
        />
    )
}

export default TambahPerusahaanPage
