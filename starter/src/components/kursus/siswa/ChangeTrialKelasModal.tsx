'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Dialog, FormItem, Select } from '@/components/ui'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import KelasService from '@/services/kursus/kelas.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IKelas, IJadwalKelas, ISiswaKelasItem } from '@/@types/kursus.types'

interface ChangeTrialKelasModalProps {
    isOpen: boolean
    trialItem: ISiswaKelasItem | null
    onClose: () => void
    onSuccess: () => void
}

type SelectOption = { value: string; label: string }

const ChangeTrialKelasModal = ({ isOpen, trialItem, onClose, onSuccess }: ChangeTrialKelasModalProps) => {
    const [kelasList, setKelasList] = useState<SelectOption[]>([])
    const [jadwalList, setJadwalList] = useState<IJadwalKelas[]>([])
    const [selectedKelas, setSelectedKelas] = useState<SelectOption | null>(null)
    const [selectedJadwal, setSelectedJadwal] = useState<SelectOption | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) return
        setSelectedKelas(null)
        setSelectedJadwal(null)
        setJadwalList([])
        setError('')

        KelasService.getAll({ aktif: 1, limit: 200 })
            .then((res) => {
                const options = res.data.map((k: IKelas) => ({ value: k.id_kelas, label: k.nama_kelas }))
                setKelasList(options)

                // Pre-select kelas dari trial
                if (trialItem?.id_kelas) {
                    const matched = options.find((o: SelectOption) => o.value === trialItem.id_kelas)
                    if (matched) {
                        setSelectedKelas(matched)
                        JadwalKelasService.getByKelas(trialItem.id_kelas)
                            .then((jRes) => {
                                const aktifJadwal = jRes.data.filter((j) => j.aktif === 1)
                                setJadwalList(aktifJadwal)
                                if (trialItem.id_jadwal_kelas) {
                                    const matchedJadwal = aktifJadwal.find(
                                        (j) => j.id_jadwal_kelas === trialItem.id_jadwal_kelas,
                                    )
                                    if (matchedJadwal) {
                                        setSelectedJadwal({
                                            value: matchedJadwal.id_jadwal_kelas,
                                            label: `${matchedJadwal.hari}, ${matchedJadwal.jam_mulai}–${matchedJadwal.jam_selesai}${matchedJadwal.nama_karyawan ? ` · ${matchedJadwal.nama_karyawan}` : ''}${matchedJadwal.kuota > 0 ? ` (${matchedJadwal.kuota_terpakai}/${matchedJadwal.kuota} terisi)` : ''}`,
                                        })
                                    }
                                }
                            })
                            .catch(() => {})
                    }
                }
            })
            .catch(() => {})
    }, [isOpen, trialItem])

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
        if (!trialItem || !selectedJadwal) {
            setError('Pilih kelas dan jadwal tujuan terlebih dahulu')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await CatatKelasSiswaService.changeTrialKelas(trialItem.id_catat, selectedJadwal.value)
            onSuccess()
            onClose()
        } catch (err) {
            setError(parseApiError(err))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={520}
            style={{ overlay: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
        >
            <h5 className="mb-1">Ubah Kelas Trial</h5>
            {trialItem && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Kelas saat ini:{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {trialItem.nama_kelas}
                    </span>
                    {trialItem.hari && (
                        <span className="text-gray-400"> · {trialItem.hari}{trialItem.jam_mulai ? `, ${trialItem.jam_mulai}` : ''}</span>
                    )}
                </p>
            )}

            <div className="flex flex-col gap-4">
                <FormItem label="Kelas Baru" asterisk>
                    <Select
                        placeholder="Pilih kelas..."
                        options={kelasList}
                        value={selectedKelas}
                        onChange={(opt) => handleKelasChange(opt as SelectOption | null)}
                    />
                </FormItem>

                {selectedKelas && (
                    <FormItem label="Jadwal Baru" asterisk>
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

                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                        <HiOutlineExclamationCircle className="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button
                    variant="solid"
                    customColorClass={() =>
                        'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                    }
                    loading={submitting}
                    disabled={!selectedJadwal}
                    onClick={handleSubmit}
                >
                    Simpan Perubahan
                </Button>
            </div>
        </Dialog>
    )
}

export default ChangeTrialKelasModal
