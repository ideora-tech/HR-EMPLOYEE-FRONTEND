'use client'

import { useState } from 'react'
import { Button, Drawer, Input, Notification, toast } from '@/components/ui'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiahInput, parseRupiah } from '@/utils/formatNumber'

interface Props {
    open: boolean
    onClose: () => void
    idSiswa: string
    namaSiswa: string
    onSuccess: () => void
}

interface CreateTagihanPayload {
    id_siswa: string
    nama_siswa: string
    nama_tagihan: string
    periode_label: string
    nominal_harga: number
    deskripsi: string | null
}

interface CreateTagihanResponse {
    message: string
    data: unknown
}

export default function CreateTagihanFromReminderDrawer({
    open,
    onClose,
    idSiswa,
    namaSiswa,
    onSuccess,
}: Props) {
    const [periodeLabel, setPeriodeLabel] = useState('')
    const [nominalHarga, setNominalHarga] = useState('')
    const [deskripsi, setDeskripsi] = useState('')
    const [loading, setLoading] = useState(false)

    const handleClose = () => {
        setPeriodeLabel('')
        setNominalHarga('')
        setDeskripsi('')
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await ApiService.fetchDataWithAxios<
                CreateTagihanResponse,
                CreateTagihanPayload
            >({
                url: API_ENDPOINTS.KURSUS.TAGIHAN.BASE,
                method: 'POST',
                data: {
                    id_siswa: idSiswa,
                    nama_siswa: namaSiswa,
                    nama_tagihan: `Perpanjangan Kursus - ${periodeLabel}`,
                    periode_label: periodeLabel,
                    nominal_harga: parseRupiah(nominalHarga),
                    deskripsi: deskripsi.trim() || null,
                },
            })
            toast.push(
                <Notification type="success" title="Tagihan dibuat">
                    Tagihan perpanjangan untuk {namaSiswa} berhasil dibuat.
                </Notification>,
            )
            onSuccess()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal membuat tagihan">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
            title="Generate Tagihan Perpanjangan"
            width={420}
        >
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 px-4 py-4"
            >
                {/* Nama Siswa — readonly */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Siswa
                    </label>
                    <Input value={namaSiswa} readOnly disabled />
                </div>

                {/* Periode Label */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Periode{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: Juni 2026 / Paket 10x"
                        value={periodeLabel}
                        onChange={(e) => setPeriodeLabel(e.target.value)}
                        required
                    />
                </div>

                {/* Nominal Harga */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nominal{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <Input
                        prefix={
                            <span className="text-gray-500 font-medium">Rp</span>
                        }
                        placeholder="0"
                        value={nominalHarga}
                        onChange={(e) =>
                            setNominalHarga(formatRupiahInput(e.target.value))
                        }
                        required
                    />
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Deskripsi
                    </label>
                    <textarea
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="plain"
                        className="flex-1"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        className="flex-1"
                        loading={loading}
                    >
                        Generate Tagihan
                    </Button>
                </div>
            </form>
        </Drawer>
    )
}
