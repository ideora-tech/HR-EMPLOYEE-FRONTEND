'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, Notification, toast } from '@/components/ui'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import KaryawanKursusForm from '@/components/kursus/karyawan/KaryawanKursusForm'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IKaryawan, IUpdateKaryawan } from '@/@types/karyawan.types'

const EditKaryawanKursusPage = () => {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [karyawan, setKaryawan] = useState<IKaryawan | null>(null)
    const [loadingData, setLoadingData] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchKaryawan = async () => {
            setLoadingData(true)
            try {
                const res = await KaryawanService.getById(id)
                if (res.success) setKaryawan(res.data)
            } catch (err) {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data karyawan">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/kursus/karyawan')
            } finally {
                setLoadingData(false)
            }
        }
        fetchKaryawan()
    }, [id, router])

    const handleSubmit = async (payload: IUpdateKaryawan) => {
        setSubmitting(true)
        try {
            await KaryawanService.update(id, payload)
            toast.push(<Notification type="success" title="Karyawan berhasil diperbarui" />)
            router.push('/kursus/karyawan')
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memperbarui karyawan">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingData) {
        return (
            <Card>
                <div className="flex justify-center py-12 text-gray-400 text-sm">Memuat data...</div>
            </Card>
        )
    }

    if (!karyawan) return null

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                    <HiOutlineArrowLeft className="text-base" />
                    Kembali
                </button>
            </div>

            <Card
                header={{
                    content: <h4>Edit Karyawan — {karyawan.nama_karyawan}</h4>,
                    bordered: false,
                }}
            >
                <KaryawanKursusForm
                    editData={karyawan}
                    submitting={submitting}
                    onCancel={() => router.back()}
                    onSubmit={handleSubmit}
                />
            </Card>
        </div>
    )
}

export default EditKaryawanKursusPage
