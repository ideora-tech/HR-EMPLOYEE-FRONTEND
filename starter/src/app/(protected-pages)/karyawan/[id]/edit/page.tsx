'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import KaryawanFormPage from '@/components/karyawan/KaryawanFormPage'
import KaryawanService from '@/services/karyawan.service'
import DepartemenService from '@/services/departemen.service'
import JabatanService from '@/services/jabatan.service'
import LokasiKantorService from '@/services/lokasi-kantor.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IKaryawan,
    ICreateKaryawan,
    IUpdateKaryawan,
} from '@/@types/karyawan.types'
import type { IDepartemen, IJabatan, ILokasiKantor } from '@/@types/organisasi.types'

const EditKaryawanPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IKaryawan | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [departemenList, setDepartemenList] = useState<IDepartemen[]>([])
    const [jabatanList, setJabatanList] = useState<IJabatan[]>([])
    const [lokasiList, setLokasiList] = useState<ILokasiKantor[]>([])
    const [existingLokasiIds, setExistingLokasiIds] = useState<string[]>([])

    useEffect(() => {
        if (!id) return
        Promise.allSettled([
            KaryawanService.getById(id),
            DepartemenService.getAll({ aktif: 1, limit: 200 }),
            JabatanService.getAll({ aktif: 1, limit: 500 }),
            LokasiKantorService.getAll({ aktif: 1, limit: 100 }),
            KaryawanService.getLokasi(id),
        ]).then(
            ([karyawanRes, deptRes, jabRes, lokasiAllRes, lokasiKaryawanRes]) => {
                if (
                    karyawanRes.status === 'fulfilled' &&
                    karyawanRes.value.success
                ) {
                    setEditData(karyawanRes.value.data)
                } else {
                    toast.push(
                        <Notification
                            type="danger"
                            title="Gagal memuat data karyawan"
                        />,
                    )
                    router.push('/karyawan')
                    return
                }
                if (deptRes.status === 'fulfilled' && deptRes.value.success)
                    setDepartemenList(deptRes.value.data)
                if (jabRes.status === 'fulfilled' && jabRes.value.success)
                    setJabatanList(jabRes.value.data)
                if (
                    lokasiAllRes.status === 'fulfilled' &&
                    lokasiAllRes.value.success
                )
                    setLokasiList(lokasiAllRes.value.data)
                if (
                    lokasiKaryawanRes.status === 'fulfilled' &&
                    lokasiKaryawanRes.value.success
                )
                    setExistingLokasiIds(
                        lokasiKaryawanRes.value.data.map(
                            (l) => l.id_lokasi,
                        ),
                    )
                setLoading(false)
            },
        )
    }, [id, router])

    const handleSubmit = async (
        payload: ICreateKaryawan | IUpdateKaryawan,
        lokasiIds: string[],
    ) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await KaryawanService.update(
                editData.id_karyawan,
                payload as IUpdateKaryawan,
            )
            await KaryawanService.setLokasi(editData.id_karyawan, lokasiIds)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.KARYAWAN)}
                />,
            )
            router.push('/karyawan')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.KARYAWAN)}
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
        <KaryawanFormPage
            editData={editData}
            submitting={submitting}
            departemenList={departemenList}
            jabatanList={jabatanList}
            lokasiList={lokasiList}
            existingLokasiIds={existingLokasiIds}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan')}
        />
    )
}

export default EditKaryawanPage

const EditKaryawanPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IKaryawan | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        KaryawanService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification
                        type="danger"
                        title="Gagal memuat data karyawan"
                    >
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/karyawan')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (
        payload: ICreateKaryawan | IUpdateKaryawan,
    ) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await KaryawanService.update(
                editData.id_karyawan,
                payload as IUpdateKaryawan,
            )
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.UPDATED(ENTITY.KARYAWAN)}
                />,
            )
            router.push('/karyawan')
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.KARYAWAN)}
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
        <KaryawanFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/karyawan')}
        />
    )
}

export default EditKaryawanPage
