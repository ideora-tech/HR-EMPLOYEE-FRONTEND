'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiah } from '@/utils/formatNumber'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import BiayaService from '@/services/kursus/biaya.service'
import SiswaService from '@/services/kursus/siswa.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import type { IJadwalKelas, IKategoriUmur, IBiaya, ISiswa } from '@/@types/kursus.types'

interface DaftarSiswaJadwalModalProps {
    isOpen: boolean
    jadwal: IJadwalKelas | null
    onClose: () => void
    onSuccess: () => void
}

type SelectOption = { value: string; label: string }

const DaftarSiswaJadwalModal = ({ isOpen, jadwal, onClose, onSuccess }: DaftarSiswaJadwalModalProps) => {
    const [siswaOptions, setSiswaOptions] = useState<SelectOption[]>([])
    const [loadingSiswa, setLoadingSiswa] = useState(false)
    const [siswaSearch, setSiswaSearch] = useState('')
    const [selectedSiswa, setSelectedSiswa] = useState<SelectOption | null>(null)

    const [kategoriList, setKategoriList] = useState<IKategoriUmur[]>([])
    const [biayaList, setBiayaList] = useState<IBiaya[]>([])

    const [selectedKategori, setSelectedKategori] = useState<SelectOption | null>(null)
    const [selectedBiaya, setSelectedBiaya] = useState<SelectOption | null>(null)
    const [totalSesi, setTotalSesi] = useState('')
    const [totalSesiAutoFilled, setTotalSesiAutoFilled] = useState(false)

    const [isTrial, setIsTrial] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen || !jadwal) return
        setSiswaSearch('')
        setSelectedSiswa(null)
        setSelectedKategori(null)
        setSelectedBiaya(null)
        setTotalSesi('')
        setTotalSesiAutoFilled(false)
        setIsTrial(false)
        setError('')

        Promise.allSettled([
            KategoriUmurService.getByKelas(jadwal.id_kelas),
            BiayaService.getByKelas(jadwal.id_kelas),
        ]).then(([katRes, biayaRes]) => {
            if (katRes.status === 'fulfilled') setKategoriList(katRes.value.data)
            if (biayaRes.status === 'fulfilled') setBiayaList(biayaRes.value.data)
        })
    }, [isOpen, jadwal])

    // Debounced siswa search
    useEffect(() => {
        if (!isOpen) return
        const timer = setTimeout(async () => {
            setLoadingSiswa(true)
            try {
                const res = await SiswaService.getAll({ search: siswaSearch || undefined, limit: 40 })
                setSiswaOptions((res.data ?? []).map((s: ISiswa) => ({
                    value: s.id_siswa,
                    label: `${s.nama_siswa}${s.telepon ? ` · ${s.telepon}` : ''}`,
                })))
            } catch {
                setSiswaOptions([])
            } finally {
                setLoadingSiswa(false)
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [siswaSearch, isOpen])

    const filteredKategori = useMemo<SelectOption[]>(() =>
        kategoriList.map((k) => ({
            value: k.id_kategori_umur,
            label: k.nama_kategori_umur + (k.sesi_pertemuan ? ` (${k.sesi_pertemuan} sesi)` : ''),
        }))
    , [kategoriList])

    const biayaOptions = useMemo<SelectOption[]>(() => {
        const list = selectedKategori
            ? biayaList.filter((b) => b.id_kategori_umur === selectedKategori.value)
            : biayaList
        return list.map((b) => ({
            value: b.id_biaya,
            label: `${b.nama_biaya}${b.nama_paket ? ` · ${b.nama_paket}` : ''} — ${formatRupiah(b.harga_biaya)}`,
        }))
    }, [biayaList, selectedKategori])

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
        if (!selectedSiswa) { setError('Pilih siswa terlebih dahulu'); return }
        if (!isTrial && !selectedBiaya) {
            setError('Pilih biaya untuk membuat tagihan, atau centang Trial jika tidak ada tagihan')
            return
        }
        if (!jadwal) return
        setSubmitting(true)
        setError('')
        try {
            if (isTrial) {
                await CatatKelasSiswaService.create({
                    id_siswa: selectedSiswa.value,
                    id_jadwal_kelas: jadwal.id_jadwal_kelas,
                    ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
                    is_trial: 1,
                })
            } else {
                await CatatKelasSiswaService.adminEnroll({
                    id_siswa: selectedSiswa.value,
                    id_jadwal_kelas: jadwal.id_jadwal_kelas,
                    id_biaya: selectedBiaya!.value,
                    ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
                })
            }
            onSuccess()
        } catch (err: unknown) {
            setError(parseApiError(err))
        } finally {
            setSubmitting(false)
        }
    }

    if (!jadwal) return null

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={800}>
            <h5 className="mb-1">Daftarkan Siswa</h5>

            {/* Jadwal info — read-only */}
            <div className="mb-5 p-3 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-100 dark:border-violet-500/20">
                <p className="text-xs text-violet-500 font-medium mb-0.5">Jadwal Kelas</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{jadwal.nama_kelas}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {jadwal.hari} · {jadwal.jam_mulai}–{jadwal.jam_selesai} · {jadwal.nama_karyawan?.trim() || '(Tanpa Coach)'}
                </p>
            </div>

            {/* Siswa — full width */}
            <div className="mb-4">
                <FormItem
                    label="Siswa"
                    asterisk
                    invalid={!!error && !selectedSiswa}
                    errorMessage={!selectedSiswa ? error : ''}
                >
                    <Select
                        placeholder="Ketik nama siswa untuk mencari..."
                        options={siswaOptions}
                        value={selectedSiswa}
                        isLoading={loadingSiswa}
                        onInputChange={(val) => setSiswaSearch(val)}
                        filterOption={() => true}
                        onChange={(opt) => {
                            setSelectedSiswa(opt as SelectOption | null)
                            setError('')
                        }}
                    />
                </FormItem>
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* LEFT — Kategori Umur */}
                <FormItem
                    label="Kategori Umur"
                    extra="Opsional — total sesi dan biaya akan disesuaikan"
                >
                    <Select
                        placeholder={filteredKategori.length === 0 ? 'Tidak ada kategori' : 'Pilih kategori umur...'}
                        isClearable
                        isDisabled={filteredKategori.length === 0}
                        options={filteredKategori}
                        value={selectedKategori}
                        onChange={(opt) => handleKategoriChange(opt as SelectOption | null)}
                    />
                </FormItem>

                {/* RIGHT — Total Sesi */}
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

                {/* LEFT — Mode Pendaftaran */}
                <FormItem label="Mode Pendaftaran">
                    <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
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

                {/* RIGHT — Biaya atau warning */}
                <div>
                    {!isTrial && biayaOptions.length > 0 && (
                        <FormItem
                            label="Biaya / Tagihan"
                            asterisk
                            extra="Tagihan dibuat otomatis setelah siswa di-assign"
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
                    {!isTrial && biayaList.length === 0 && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 mt-6">
                            <HiOutlineExclamationCircle className="text-lg text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Tidak ada biaya untuk kelas ini. Tambahkan di Master Biaya, atau gunakan mode Trial.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && selectedSiswa && (
                <div className="flex items-start gap-2 p-3 mt-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                    <HiOutlineExclamationCircle className="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>Batal</Button>
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

export default DaftarSiswaJadwalModal
