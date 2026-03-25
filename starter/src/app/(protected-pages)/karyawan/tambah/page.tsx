'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import KaryawanFormPage from '@/components/karyawan/KaryawanFormPage'
import KaryawanService from '@/services/karyawan.service'
import DepartemenService from '@/services/departemen.service'
import JabatanService from '@/services/jabatan.service'
import LokasiKantorService from '@/services/lokasi-kantor.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICreateKaryawan, IUpdateKaryawan } from '@/@types/karyawan.types'
import type { IDepartemen, IJabatan, ILokasiKantor } from '@/@types/organisasi.types'

const TambahKaryawanPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [departemenList, setDepartemenList] = useState<IDepartemen[]>([])
    const [jabatanList, setJabatanList] = useState<IJabatan[]>([])
    const [lokasiList, setLokasiList] = useState<ILokasiKantor[]>([])

    useEffect(() => {
        Promise.allSettled([
            DepartemenService.getAll({ aktif: 1, limit: 200 }),
            JabatanService.getAll({ aktif: 1, limit: 500 }),
            LokasiKantorService.getAll({ aktif: 1, limit: 100 }),
        ]).then(([deptRes, jabRes, lokasiRes]) => {
            if (deptRes.status === 'fulfilled' && deptRes.value.success)
                setDepartemenList(deptRes.value.data)
            if (jabRes.status === 'fulfilled' && jabRes.value.success)
                setJabatanList(jabRes.value.data)
            if (lokasiRes.status === 'fulfilled' && lokasiRes.value.success)
                setLokasiList(lokasiRes.value.data)
        })
    }, [])

    const handleSubmit = async (
        payload: ICreateKaryawan | IUpdateKaryawan,
        lokasiIds: string[],
        fotoFile?: File | null,
    ) => {
        setSubmitting(true)
        try {
            const res = await KaryawanService.create(payload as ICreateKaryawan)
            if (fotoFile) {
                await KaryawanService.uploadFoto(res.data.id_karyawan, fotoFile)
            }
            if (lokasiIds.length > 0) {
                await KaryawanService.setLokasi(res.data.id_karyawan, lokasiIds)
            }
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
            departemenList={departemenList}
            jabatanList={jabatanList}
            lokasiList={lokasiList}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan')}
        />
    )
}

export default TambahKaryawanPage
