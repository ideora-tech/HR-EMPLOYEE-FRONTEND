'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiah } from '@/utils/formatNumber'
import KelasService from '@/services/kursus/kelas.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import BiayaService from '@/services/kursus/biaya.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import type { ISiswa, IKelas, IKategoriUmur, IJadwalKelas, IBiaya } from '@/@types/kursus.types'

interface AssignKelasModalProps {
    isOpen: boolean
    siswa: ISiswa | null
    onClose: () => void
    onSuccess: () => void
}

type SelectOption = { value: string; label: string }

const AssignKelasModal = ({ isOpen, siswa, onClose, onSuccess }: AssignKelasModalProps) => {
    const [kelasList, setKelasList] = useState<SelectOption[]>([])
    const [jadwalList, setJadwalList] = useState<IJadwalKelas[]>([])
    const [kategoriList, setKategoriList] = useState<IKategoriUmur[]>([])
    const [biayaList, setBiayaList] = useState<IBiaya[]>([])

    const [selectedKelas, setSelectedKelas] = useState<SelectOption | null>(null)
    const [selectedJadwal, setSelectedJadwal] = useState<SelectOption | null>(null)
    const [selectedPaket, setSelectedPaket] = useState<SelectOption | null>(null)
    const [selectedKategori, setSelectedKategori] = useState<SelectOption | null>(null)
    const [selectedBiaya, setSelectedBiaya] = useState<SelectOption | null>(null)
    const [totalSesi, setTotalSesi] = useState('')
    const [totalSesiAutoFilled, setTotalSesiAutoFilled] = useState(false)

    const [submitting, setSubmitting] = useState(false)
    const [isTrial, setIsTrial] = useState(false)
    const [error, setError] = useState('')

    // Reset on open
    useEffect(() => {
        if (!isOpen) return
        setSelectedKelas(null)
        setSelectedJadwal(null)
        setSelectedPaket(null)
        setSelectedKategori(null)
        setSelectedBiaya(null)
        setJadwalList([])
        setKategoriList([])
        setBiayaList([])
        setTotalSesi('')
        setTotalSesiAutoFilled(false)
        setError('')
        setIsTrial(false)

        KelasService.getAll({ aktif: 1, limit: 200 }).then((res) => {
            setKelasList(res.data.map((k: IKelas) => ({ value: k.id_kelas, label: k.nama_kelas })))
        }).catch(() => { })
    }, [isOpen])

    const handleKelasChange = async (opt: SelectOption | null) => {
        setSelectedKelas(opt)
        setSelectedJadwal(null)
        setSelectedPaket(null)
        setSelectedKategori(null)
        setSelectedBiaya(null)
        setJadwalList([])
        setKategoriList([])
        setBiayaList([])
        setTotalSesi('')
        setTotalSesiAutoFilled(false)
        setError('')
        if (!opt) return
        try {
            const [jadwalRes, kategoriRes, biayaRes] = await Promise.allSettled([
                JadwalKelasService.getByKelas(opt.value),
                KategoriUmurService.getByKelas(opt.value),
                BiayaService.getByKelas(opt.value),
            ])
            if (jadwalRes.status === 'fulfilled') setJadwalList(jadwalRes.value.data.filter((j) => j.aktif === 1))
            if (kategoriRes.status === 'fulfilled') setKategoriList(kategoriRes.value.data)
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

    const paketOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>()
        kategoriList.forEach((k) => {
            if (k.id_paket && k.nama_paket) map.set(k.id_paket, k.nama_paket)
        })
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    }, [kategoriList])

    const filteredKategori = useMemo<SelectOption[]>(() => {
        const list = selectedPaket
            ? kategoriList.filter((k) => k.id_paket === selectedPaket.value)
            : kategoriList
        return list.map((k) => ({
            value: k.id_kategori_umur,
            label: k.nama_kategori_umur + (k.sesi_pertemuan ? ` (${k.sesi_pertemuan} sesi)` : ''),
        }))
    }, [kategoriList, selectedPaket])

    // Biaya options: filter berdasarkan kategori umur jika dipilih, jika tidak tampilkan semua
    const biayaOptions = useMemo<SelectOption[]>(() => {
        const list = selectedKategori
            ? biayaList.filter((b) => b.id_kategori_umur === selectedKategori.value)
            : biayaList
        return list.map((b) => ({
            value: b.id_biaya,
            label: `${b.nama_biaya}${b.nama_paket ? ` · ${b.nama_paket}` : ''} — ${formatRupiah(b.harga_biaya)}`,
        }))
    }, [biayaList, selectedKategori])

    // Auto-select biaya jika hanya ada 1 pilihan
    useEffect(() => {
        if (biayaOptions.length === 1 && !isTrial) {
            setSelectedBiaya(biayaOptions[0])
        } else if (biayaOptions.length !== 1) {
            setSelectedBiaya(null)
        }
    }, [biayaOptions, isTrial])

    const handleKategoriChange = (opt: SelectOption | null) => {
        setSelectedKategori(opt)
        setSelectedBiaya(null)
        setError('')
        if (!opt) {
            if (totalSesiAutoFilled) { setTotalSesi(''); setTotalSesiAutoFilled(false) }
            return
        }
        const found = kategoriList.find((k) => k.id_kategori_umur === opt.value)
        if (found?.sesi_pertemuan) {
            setTotalSesi(String(found.sesi_pertemuan))
            setTotalSesiAutoFilled(true)
        }
    }

    const handleSubmit = async () => {
        if (!siswa || !selectedKelas) {
            setError('Pilih kelas terlebih dahulu')
            return
        }
        if (!selectedJadwal) {
            setError('Pilih jadwal / jam kelas terlebih dahulu')
            return
        }
        if (!isTrial && !selectedBiaya) {
            setError('Pilih biaya untuk membuat tagihan, atau centang Trial jika tidak ada tagihan')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            if (isTrial) {
                // Trial: hanya buat catat_kelas_siswa, tanpa tagihan
                await CatatKelasSiswaService.create({
                    id_siswa: siswa.id_siswa,
                    id_jadwal_kelas: selectedJadwal.value,
                    ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
                    is_trial: 1,
                })
            } else {
                // Reguler: buat catat_kelas_siswa + tagihan dalam 1 transaksi
                await CatatKelasSiswaService.adminEnroll({
                    id_siswa: siswa.id_siswa,
                    id_jadwal_kelas: selectedJadwal.value,
                    id_biaya: selectedBiaya!.value,
                    ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
                })
            }
            onSuccess()
            onClose()
        } catch (err: unknown) {
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
            width={600}
            style={{ overlay: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
        >
            <h5 className="mb-1">Input Kelas</h5>
            {siswa && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Siswa:{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {siswa.nama_siswa}
                    </span>
                </p>
            )}

            <div className="flex flex-col gap-4">
                {/* Kelas */}
                <FormItem
                    label="Kelas"
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

                {/* Jadwal */}
                {selectedKelas && (
                    <FormItem
                        label="Jadwal / Jam Kelas"
                        asterisk
                        extra="Pilih jadwal kelas yang akan diikuti"
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

                {/* Paket */}
                {selectedKelas && paketOptions.length > 0 && (
                    <FormItem
                        label="Paket"
                        extra="Opsional — filter kategori umur berdasarkan paket"
                    >
                        <Select
                            placeholder="Pilih paket..."
                            isClearable
                            options={paketOptions}
                            value={selectedPaket}
                            onChange={(opt) => {
                                setSelectedPaket(opt as SelectOption | null)
                                setSelectedKategori(null)
                                setSelectedBiaya(null)
                                if (totalSesiAutoFilled) { setTotalSesi(''); setTotalSesiAutoFilled(false) }
                            }}
                        />
                    </FormItem>
                )}

                {/* Kategori Umur */}
                {selectedKelas && filteredKategori.length > 0 && (
                    <FormItem
                        label="Kategori Umur"
                        extra="Opsional — total sesi dan pilihan biaya akan disesuaikan"
                    >
                        <Select
                            placeholder="Pilih kategori umur..."
                            isClearable
                            options={filteredKategori}
                            value={selectedKategori}
                            onChange={(opt) => handleKategoriChange(opt as SelectOption | null)}
                        />
                    </FormItem>
                )}

                {/* Trial toggle */}
                <FormItem label="Mode Pendaftaran">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isTrial}
                            onChange={(e) => {
                                setIsTrial(e.target.checked)
                                setSelectedBiaya(null)
                                setError('')
                            }}
                            className="w-4 h-4 accent-violet-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Daftarkan sebagai Trial{' '}
                            <span className="text-gray-400">(gratis, tidak ada tagihan)</span>
                        </span>
                    </label>
                </FormItem>

                {/* Biaya — hanya tampil jika bukan trial dan ada pilihan biaya */}
                {selectedKelas && !isTrial && biayaOptions.length > 0 && (
                    <FormItem
                        label="Biaya / Tagihan"
                        asterisk
                        extra="Tagihan akan dibuat otomatis setelah kelas di-assign"
                        invalid={!!error && !selectedBiaya}
                        errorMessage={!selectedBiaya ? error : ''}
                    >
                        <Select
                            placeholder="Pilih biaya..."
                            options={biayaOptions}
                            value={selectedBiaya}
                            onChange={(opt) => {
                                setSelectedBiaya(opt as SelectOption | null)
                                setError('')
                            }}
                        />
                    </FormItem>
                )}

                {/* Info jika tidak ada biaya tersedia */}
                {selectedKelas && !isTrial && biayaList.length === 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                        <HiOutlineExclamationCircle className="text-lg text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            Tidak ada data biaya untuk kelas ini. Tambahkan biaya di menu Master Biaya, atau daftarkan sebagai Trial.
                        </p>
                    </div>
                )}

                {/* Total Sesi */}
                <FormItem
                    label="Total Sesi"
                    extra={totalSesiAutoFilled ? 'Diisi otomatis dari kategori umur' : 'Opsional — kosongkan jika tidak dibatasi'}
                >
                    <Input
                        type="number"
                        min={1}
                        placeholder="Contoh: 16"
                        value={totalSesi}
                        onChange={(e) => {
                            setTotalSesi(e.target.value)
                            setTotalSesiAutoFilled(false)
                        }}
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
                    customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    {isTrial ? 'Daftar Trial' : 'Assign & Buat Tagihan'}
                </Button>
            </div>
        </Dialog>
    )
}

export default AssignKelasModal
