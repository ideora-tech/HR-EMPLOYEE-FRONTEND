'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { formatRupiah } from '@/utils/formatNumber'
import { parseApiError } from '@/utils/parseApiError'
import KelasService from '@/services/kursus/kelas.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import BiayaService from '@/services/kursus/biaya.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import type { IKelas, IJadwalKelas, IBiaya, ISiswaKelasItem } from '@/@types/kursus.types'

interface ConvertTrialModalProps {
    isOpen: boolean
    trialItem: ISiswaKelasItem | null
    onClose: () => void
    onSuccess: () => void
}

type SelectOption = { value: string; label: string }

const ConvertTrialModal = ({ isOpen, trialItem, onClose, onSuccess }: ConvertTrialModalProps) => {
    const [kelasList, setKelasList] = useState<SelectOption[]>([])
    const [jadwalList, setJadwalList] = useState<IJadwalKelas[]>([])
    const [biayaList, setBiayaList] = useState<IBiaya[]>([])

    const [selectedKelas, setSelectedKelas] = useState<SelectOption | null>(null)
    const [selectedJadwal, setSelectedJadwal] = useState<SelectOption | null>(null)
    const [selectedBiaya, setSelectedBiaya] = useState<SelectOption | null>(null)
    const [totalSesi, setTotalSesi] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) return
        setSelectedKelas(null)
        setSelectedJadwal(null)
        setSelectedBiaya(null)
        setJadwalList([])
        setBiayaList([])
        setTotalSesi(trialItem?.total_sesi != null ? String(trialItem.total_sesi) : '')
        setError('')

        KelasService.getAll({ aktif: 1, limit: 200 })
            .then((res) => {
                const options = res.data.map((k: IKelas) => ({ value: k.id_kelas, label: k.nama_kelas }))
                setKelasList(options)

                if (trialItem?.id_kelas) {
                    const matched = options.find((o: SelectOption) => o.value === trialItem.id_kelas)
                    if (matched) {
                        setSelectedKelas(matched)
                        // Load jadwal + biaya untuk kelas trial
                        Promise.allSettled([
                            JadwalKelasService.getByKelas(trialItem.id_kelas),
                            BiayaService.getByKelas(trialItem.id_kelas),
                        ]).then(([jadwalRes, biayaRes]) => {
                            if (jadwalRes.status === 'fulfilled') {
                                const aktifJadwal = jadwalRes.value.data.filter((j) => j.aktif === 1)
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
                            }
                            if (biayaRes.status === 'fulfilled') {
                                setBiayaList(biayaRes.value.data)
                            }
                        })
                    }
                }
            })
            .catch(() => { })
    }, [isOpen, trialItem])

    const fetchSesiFromBiaya = useCallback(async (biaya: IBiaya) => {
        if (!biaya.id_kategori_umur) return
        try {
            const res = await KategoriUmurService.getById(biaya.id_kategori_umur)
            const sesi = res.data?.sesi_pertemuan
            if (sesi != null) setTotalSesi(String(sesi))
        } catch { }
    }, [])

    // Auto-select biaya jika hanya 1 pilihan, lalu auto-fill total sesi
    useEffect(() => {
        if (biayaList.length === 1) {
            const b = biayaList[0]
            setSelectedBiaya({
                value: b.id_biaya,
                label: `${b.nama_biaya}${b.nama_paket ? ` · ${b.nama_paket}` : ''} — ${formatRupiah(b.harga_biaya)}`,
            })
            setTotalSesi('')
            fetchSesiFromBiaya(b)
        } else {
            setSelectedBiaya(null)
        }
    }, [biayaList, fetchSesiFromBiaya])

    const handleKelasChange = async (opt: SelectOption | null) => {
        setSelectedKelas(opt)
        setSelectedJadwal(null)
        setSelectedBiaya(null)
        setJadwalList([])
        setBiayaList([])
        setTotalSesi('')
        setError('')
        if (!opt) return
        try {
            const [jadwalRes, biayaRes] = await Promise.allSettled([
                JadwalKelasService.getByKelas(opt.value),
                BiayaService.getByKelas(opt.value),
            ])
            if (jadwalRes.status === 'fulfilled') setJadwalList(jadwalRes.value.data.filter((j) => j.aktif === 1))
            if (biayaRes.status === 'fulfilled') setBiayaList(biayaRes.value.data)
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

    const biayaOptions = useMemo<SelectOption[]>(() => {
        return biayaList.map((b) => ({
            value: b.id_biaya,
            label: `${b.nama_biaya}${b.nama_paket ? ` · ${b.nama_paket}` : ''} — ${formatRupiah(b.harga_biaya)}`,
        }))
    }, [biayaList])

    const handleSubmit = async () => {
        if (!trialItem) return
        if (!selectedJadwal) {
            setError('Pilih kelas dan jadwal tujuan terlebih dahulu')
            return
        }
        if (!selectedBiaya) {
            setError('Pilih biaya untuk membuat tagihan')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await CatatKelasSiswaService.convertTrial(trialItem.id_catat, {
                id_jadwal_kelas: selectedJadwal.value,
                id_biaya: selectedBiaya.value,
                ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(parseApiError(err))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={520}
            style={{ overlay: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
        >
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

                {selectedKelas && (
                    <FormItem
                        label="Biaya / Tagihan"
                        asterisk
                        extra="Tagihan dibuat otomatis saat convert"
                        invalid={!!error && !!selectedJadwal && !selectedBiaya}
                        errorMessage={selectedJadwal && !selectedBiaya ? error : ''}
                    >
                        {biayaOptions.length === 0 ? (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                                <HiOutlineExclamationCircle className="text-lg text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Tidak ada data biaya untuk kelas ini. Tambahkan di menu Master Biaya.
                                </p>
                            </div>
                        ) : (
                            <Select
                                placeholder="Pilih biaya..."
                                options={biayaOptions}
                                value={selectedBiaya}
                                onChange={(opt) => {
                                    const selected = opt as SelectOption | null
                                    setSelectedBiaya(selected)
                                    setError('')
                                    setTotalSesi('')
                                    const biaya = selected
                                        ? biayaList.find((b) => b.id_biaya === selected.value)
                                        : null
                                    if (biaya) fetchSesiFromBiaya(biaya)
                                }}
                            />
                        )}
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
                        'bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white border-violet-500'
                    }
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    Convert & Buat Tagihan
                </Button>
            </div>
        </Dialog>
    )
}

export default ConvertTrialModal
