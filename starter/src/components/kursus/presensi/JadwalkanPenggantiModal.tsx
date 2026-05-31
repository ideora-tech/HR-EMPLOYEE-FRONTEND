'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select, Notification, toast } from '@/components/ui'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import SiswaSesiPenggantiService from '@/services/kursus/siswa-sesi-pengganti.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IJadwalKelas, ApiPaginatedResponse } from '@/@types/kursus.types'

interface JadwalOption {
    value: string
    label: string
}

interface JadwalkanPenggantiModalProps {
    open: boolean
    idPresensiAsal: string | null
    namaSiswa: string
    namaKelasAsal: string
    onClose: () => void
    onSuccess: () => void
}

const HARI_ORDER: Record<string, number> = {
    SENIN: 1, SELASA: 2, RABU: 3, KAMIS: 4, JUMAT: 5, SABTU: 6, MINGGU: 7,
}

const JadwalkanPenggantiModal = ({
    open,
    idPresensiAsal,
    namaSiswa,
    namaKelasAsal,
    onClose,
    onSuccess,
}: JadwalkanPenggantiModalProps) => {
    const [jadwalOptions, setJadwalOptions] = useState<JadwalOption[]>([])
    const [idJadwalTujuan, setIdJadwalTujuan] = useState('')
    const [tanggal, setTanggal] = useState('')
    const [keterangan, setKeterangan] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) {
            setIdJadwalTujuan('')
            setTanggal('')
            setKeterangan('')
            return
        }

        const fetchJadwal = async () => {
            try {
                const res = await ApiService.fetchDataWithAxios<ApiPaginatedResponse<IJadwalKelas>>({
                    url: `${API_ENDPOINTS.KURSUS.JADWAL_KELAS.BASE}?limit=200&aktif=1`,
                    method: 'GET',
                })
                if (res.success) {
                    const sorted = [...res.data].sort((a, b) => {
                        const dayDiff = (HARI_ORDER[a.hari] ?? 9) - (HARI_ORDER[b.hari] ?? 9)
                        if (dayDiff !== 0) return dayDiff
                        return a.jam_mulai.localeCompare(b.jam_mulai)
                    })
                    setJadwalOptions(sorted.map((j) => ({
                        value: j.id_jadwal_kelas,
                        label: `${j.nama_kelas ?? '-'} — ${j.hari} ${j.jam_mulai}–${j.jam_selesai}${j.nama_karyawan ? ` (${j.nama_karyawan})` : ''}`,
                    })))
                }
            } catch {
                /* silent */
            }
        }

        fetchJadwal()
    }, [open])

    const handleSubmit = async () => {
        if (!idPresensiAsal || !idJadwalTujuan || !tanggal) {
            toast.push(
                <Notification type="warning" title="Lengkapi semua field yang wajib diisi" />,
            )
            return
        }

        setSubmitting(true)
        try {
            await SiswaSesiPenggantiService.create({
                id_presensi_asal: idPresensiAsal,
                id_jadwal_kelas_tujuan: idJadwalTujuan,
                tanggal_pengganti: tanggal,
                keterangan: keterangan.trim() || undefined,
            })
            toast.push(
                <Notification type="success" title="Sesi pengganti berhasil dijadwalkan" />,
            )
            onSuccess()
            onClose()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menjadwalkan sesi pengganti">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={480}>
            <div className="p-6 flex flex-col gap-5">
                <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                        Jadwalkan Sesi Pengganti
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{namaSiswa}</span>
                        {' '}absen dari{' '}
                        <span className="font-medium text-gray-700 dark:text-gray-200">{namaKelasAsal}</span>
                    </p>
                </div>

                <FormItem label="Kelas Tujuan" asterisk>
                    <Select<JadwalOption>
                        placeholder="Pilih jadwal kelas..."
                        options={jadwalOptions}
                        value={jadwalOptions.find((o) => o.value === idJadwalTujuan) ?? null}
                        onChange={(opt) => setIdJadwalTujuan((opt as JadwalOption)?.value ?? '')}
                    />
                </FormItem>

                <FormItem label="Tanggal Makeup" asterisk>
                    <Input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                    />
                </FormItem>

                <FormItem label="Keterangan">
                    <Input
                        placeholder="Opsional..."
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                    />
                </FormItem>

                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="plain" onClick={onClose} disabled={submitting}>
                        Batal
                    </Button>
                    <Button
                        variant="solid"
                        customColorClass={() => 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white border-indigo-500'}
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        Jadwalkan
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default JadwalkanPenggantiModal
