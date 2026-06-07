'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Notification, toast } from '@/components/ui'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import KaryawanKursusForm from '@/components/kursus/karyawan/KaryawanKursusForm'
import KaryawanService from '@/services/karyawan.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ICreateKaryawan } from '@/@types/karyawan.types'

const TambahKaryawanKursusPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (payload: ICreateKaryawan) => {
        setSubmitting(true)
        try {
            await KaryawanService.create(payload)
            toast.push(<Notification type="success" title="Karyawan berhasil ditambahkan" />)
            router.push('/kursus/karyawan')
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menambahkan karyawan">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

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
                    content: <h4>Tambah Karyawan Baru</h4>,
                    bordered: false,
                }}
            >
                <KaryawanKursusForm
                    submitting={submitting}
                    onCancel={() => router.back()}
                    onSubmit={handleSubmit}
                />
            </Card>
        </div>
    )
}

export default TambahKaryawanKursusPage
