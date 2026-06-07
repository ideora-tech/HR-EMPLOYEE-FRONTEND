'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Dialog, FormItem, Input, Select, Notification, toast } from '@/components/ui'
import KelasService from '@/services/kursus/kelas.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IKelas, IJadwalKelas, ISiswaKelasItem } from '@/@types/kursus.types'

interface ConvertTrialModalProps {
    isOpen: boolean
    trialItem: ISiswaKelasItem | null
    onClose: () => void
    onSuccess: (idJadwalKelas: string) => void
}

type SelectOption = { value: string; label: string }

const ConvertTrialModal = ({ isOpen, trialItem, onClose, onSuccess }: ConvertTrialModalProps) => {
    const [kelasList, setKelasList] = useState<SelectOption[]>([])
    const [jadwalList, setJadwalList] = useState<IJadwalKelas[]>([])

    const [selectedKelas, setSelectedKelas] = useState<SelectOption | null>(null)
    const [selectedJadwal, setSelectedJadwal] = useState<SelectOption | null>(null)
    const [totalSesi, setTotalSesi] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) return
        setSelectedKelas(null)
        setSelectedJadwal(null)
        setJadwalList([])
        setTotalSesi('')
        setError('')
        KelasService.getAll({ aktif: 1, limit: 200 })
            .then((res) => {
                setKelasList(res.data.map((k: IKelas) => ({ value: k.id_kelas, label: k.nama_kelas })))
            })
            .catch(() => {})
    }, [isOpen])

    const handleKelasChange = async (opt: SelectOption | null) => {
        setSelectedKelas(opt)
        setSelectedJadwal(null)
        setJadwalList([])
        setError('')
        if (!opt) return
        try {
            const res = await JadwalKelasService.getByKelas(opt.value)
            setJadwalList(res.data.filter((j) => j.aktif === 1))
        } catch {
            // lanjutkan meski gagal
        }
    }

    const jadwalOptions = useMemo<SelectOption[]>(() => {
        return jadwalList.map((j) => ({
            value: j.id_jadwal_kelas,
            label: `${j.hari}, ${j.jam_mulai}–${j.jam_selesai}${j.nama_karyawan ? ` · ${j.nama_karyawan}` : ''}${j.kuota > 0 ? ` (${j.kuota_terpakai}/${j.kuota} terisi)` : ''}`,
        }))
    }, [jadwalList])

    const handleSubmit = async () => {
        if (!trialItem) return
        if (!selectedJadwal) {
            setError('Pilih kelas dan jadwal tujuan terlebih dahulu')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await CatatKelasSiswaService.convertTrial(trialItem.id_catat, {
                id_jadwal_kelas: selectedJadwal.value,
                ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
            })
            toast.push(<Notification type="success" title="Siswa berhasil dikonversi ke kelas reguler" />)
            onSuccess(selectedJadwal.value)
            onClose()
        } catch (err) {
            setError(parseApiError(err))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={480}>
            <h5 className="mb-1">Convert Trial ke Reguler</h5>
            {trialItem && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Trial:{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {trialItem.nama_kelas}
                    </span>
                </p>
            )}

            <div className="flex flex-col gap-4">
                <FormItem
                    label="Kelas Tujuan"
                    asterisk
                    invalid={!!error && !selectedKelas}
                    errorMessage={!selectedKelas ? error : ''}
                >
                    <Select
                        placeholder="Pilih kelas..."
                        options={kelasList}
                        value={selectedKelas}
                        onChange={(opt) => handleKelasChange(opt as SelectOption | null)}
                    />
                </FormItem>

                {selectedKelas && (
                    <FormItem
                        label="Jadwal"
                        asterisk
                        invalid={!!error && !!selectedKelas && !selectedJadwal}
                        errorMessage={selectedKelas && !selectedJadwal ? error : ''}
                    >
                        <Select
                            placeholder={jadwalList.length === 0 ? 'Tidak ada jadwal tersedia' : 'Pilih jadwal...'}
                            options={jadwalOptions}
                            value={selectedJadwal}
                            isDisabled={jadwalList.length === 0}
                            onChange={(opt) => {
                                setSelectedJadwal(opt as SelectOption | null)
                                setError('')
                            }}
                        />
                    </FormItem>
                )}

                <FormItem
                    label="Total Sesi"
                    extra="Opsional — kosongkan jika tidak dibatasi"
                >
                    <Input
                        type="number"
                        min={1}
                        placeholder="Contoh: 16"
                        value={totalSesi}
                        onChange={(e) => setTotalSesi(e.target.value)}
                    />
                </FormItem>

                {error && selectedJadwal && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button
                    variant="solid"
                    customColorClass={() =>
                        'bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white border-violet-500'
                    }
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    Convert
                </Button>
            </div>
        </Dialog>
    )
}

export default ConvertTrialModal
