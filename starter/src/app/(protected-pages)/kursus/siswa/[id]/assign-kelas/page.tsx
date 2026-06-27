'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, FormItem, Input, Select, Notification, toast, Spinner } from '@/components/ui'
import { HiArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiah } from '@/utils/formatNumber'
import KelasService from '@/services/kursus/kelas.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import BiayaService from '@/services/kursus/biaya.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import SiswaService from '@/services/kursus/siswa.service'
import { ROUTES } from '@/constants/route.constant'
import type { ISiswa, IKelas, IKategoriUmur, IJadwalKelas, IBiaya } from '@/@types/kursus.types'

type SelectOption = { value: string; label: string }

const AssignKelasPage = () => {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const [siswa, setSiswa] = useState<ISiswa | null>(null)
    const [loadingSiswa, setLoadingSiswa] = useState(true)

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
    const [isTrial, setIsTrial] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return
        SiswaService.getById(id)
            .then((res) => { if (res.success) setSiswa(res.data) })
            .catch(() => { })
            .finally(() => setLoadingSiswa(false))

        KelasService.getAll({ aktif: 1, limit: 200 })
            .then((res) => {
                setKelasList(res.data.map((k: IKelas) => ({ value: k.id_kelas, label: k.nama_kelas })))
            })
            .catch(() => { })
    }, [id])

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
        } catch { /* lanjutkan */ }
    }

    const handlePaketChange = async (opt: SelectOption | null, currentKelasId: string | null) => {
        setSelectedPaket(opt)
        setSelectedKategori(null)
        setSelectedBiaya(null)
        if (totalSesiAutoFilled) { setTotalSesi(''); setTotalSesiAutoFilled(false) }
        if (!opt) {
            // kembali ke biaya level kelas
            if (currentKelasId) {
                try {
                    const res = await BiayaService.getByKelas(currentKelasId)
                    if (res.success) setBiayaList(res.data)
                } catch { setBiayaList([]) }
            } else {
                setBiayaList([])
            }
            return
        }
        try {
            const res = await BiayaService.getByPaket(opt.value)
            if (res.success) setBiayaList(res.data)
        } catch { setBiayaList([]) }
    }

    const jadwalOptions = useMemo<SelectOption[]>(() =>
        jadwalList.map((j) => ({
            value: j.id_jadwal_kelas,
            label: `${j.hari}, ${j.jam_mulai}–${j.jam_selesai}${j.nama_karyawan ? ` · ${j.nama_karyawan}` : ''}${j.kuota > 0 ? ` (${j.kuota_terpakai}/${j.kuota} terisi)` : ''}`,
        })), [jadwalList])

    const selectedJadwalData = useMemo(
        () => jadwalList.find((j) => j.id_jadwal_kelas === selectedJadwal?.value) ?? null,
        [jadwalList, selectedJadwal],
    )
    const jadwalPenuh = selectedJadwalData !== null
        && selectedJadwalData.kuota !== null
        && selectedJadwalData.kuota_terpakai >= selectedJadwalData.kuota

    const paketOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>()
        kategoriList.forEach((k) => { if (k.id_paket && k.nama_paket) map.set(k.id_paket, k.nama_paket) })
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    }, [kategoriList])

    const filteredKategori = useMemo<SelectOption[]>(() => {
        const list = selectedPaket ? kategoriList.filter((k) => k.id_paket === selectedPaket.value) : kategoriList
        return list.map((k) => ({
            value: k.id_kategori_umur,
            label: k.nama_kategori_umur + (k.sesi_pertemuan ? ` (${k.sesi_pertemuan} sesi)` : ''),
        }))
    }, [kategoriList, selectedPaket])

    const biayaOptions = useMemo<SelectOption[]>(() =>
        biayaList.map((b) => ({
            value: b.id_biaya,
            label: `${b.nama_biaya}${b.nama_paket ? ` · ${b.nama_paket}` : ''} — ${formatRupiah(b.harga_biaya)}`,
        }))
    , [biayaList])

    useEffect(() => {
        if (biayaOptions.length === 1 && !isTrial) {
            setSelectedBiaya(biayaOptions[0])
        } else if (biayaOptions.length !== 1) {
            setSelectedBiaya(null)
        }
    }, [biayaOptions, isTrial])

    const handleKategoriChange = async (opt: SelectOption | null, currentPaketId: string | null, currentKelasId: string | null) => {
        setSelectedKategori(opt)
        setSelectedBiaya(null)
        setError('')
        if (!opt) {
            if (totalSesiAutoFilled) { setTotalSesi(''); setTotalSesiAutoFilled(false) }
            // kembali ke biaya level paket atau kelas
            try {
                if (currentPaketId) {
                    const res = await BiayaService.getByPaket(currentPaketId)
                    if (res.success) setBiayaList(res.data)
                } else if (currentKelasId) {
                    const res = await BiayaService.getByKelas(currentKelasId)
                    if (res.success) setBiayaList(res.data)
                } else {
                    setBiayaList([])
                }
            } catch { setBiayaList([]) }
            return
        }
        try {
            const res = await BiayaService.getByKategoriUmur(opt.value)
            if (res.success) setBiayaList(res.data)
        } catch { setBiayaList([]) }

        const found = kategoriList.find((k) => k.id_kategori_umur === opt.value)
        if (found?.sesi_pertemuan) {
            setTotalSesi(String(found.sesi_pertemuan))
            setTotalSesiAutoFilled(true)
        }
    }

    const handleSubmit = async () => {
        if (!siswa || !selectedKelas) { setError('Pilih kelas terlebih dahulu'); return }
        if (!selectedJadwal) { setError('Pilih jadwal / jam kelas terlebih dahulu'); return }
        if (!isTrial && !selectedBiaya) {
            setError('Pilih biaya untuk membuat tagihan, atau centang Trial jika tidak ada tagihan')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            if (isTrial) {
                await CatatKelasSiswaService.create({
                    id_siswa: siswa.id_siswa,
                    id_jadwal_kelas: selectedJadwal.value,
                    ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
                    is_trial: 1,
                })
            } else {
                await CatatKelasSiswaService.adminEnroll({
                    id_siswa: siswa.id_siswa,
                    id_jadwal_kelas: selectedJadwal.value,
                    id_biaya: selectedBiaya!.value,
                    ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
                })
            }
            toast.push(<Notification type="success" title="Kelas berhasil di-assign" />)
            router.push(ROUTES.KURSUS_SISWA_DETAIL(id))
        } catch (err: unknown) {
            setError(parseApiError(err))
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingSiswa) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Page header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push(ROUTES.KURSUS_SISWA_DETAIL(id))}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h3 className="font-bold">Input Kelas</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {siswa
                            ? <>Siswa: <span className="font-semibold text-gray-700 dark:text-gray-200">{siswa.nama_siswa}</span></>
                            : 'Daftarkan siswa ke kelas'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">

                    {/* Section: Kelas & Jadwal */}
                    <div>
                        <div className="mb-4">
                            <h5 className="font-semibold">Kelas &amp; Jadwal</h5>
                            <p className="text-gray-500 text-sm mt-0.5">Pilih kelas dan jadwal yang akan diikuti siswa</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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

                            <FormItem
                                label="Jadwal / Jam Kelas"
                                asterisk
                                invalid={!!error && !!selectedKelas && !selectedJadwal}
                                errorMessage={selectedKelas && !selectedJadwal ? error : ''}
                            >
                                <Select
                                    placeholder={!selectedKelas ? 'Pilih kelas dulu...' : jadwalList.length === 0 ? 'Tidak ada jadwal' : 'Pilih jadwal...'}
                                    options={jadwalOptions}
                                    value={selectedJadwal}
                                    isDisabled={!selectedKelas || jadwalList.length === 0}
                                    onChange={(opt) => { setSelectedJadwal(opt as SelectOption | null); setError('') }}
                                />
                                {jadwalPenuh && (
                                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                                        <HiOutlineExclamationCircle className="text-base text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            Jadwal ini sudah penuh ({selectedJadwalData?.kuota_terpakai}/{selectedJadwalData?.kuota} terisi). Siswa tidak dapat didaftarkan.
                                        </p>
                                    </div>
                                )}
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t mt-4 mb-4 border-gray-100 dark:border-gray-700" />

                    {/* Section: Paket & Kategori */}
                    <div>
                        <div className="mb-4">
                            <h5 className="font-semibold">Paket &amp; Kategori Umur</h5>
                            <p className="text-gray-500 text-sm mt-0.5">Opsional — total sesi dan biaya akan disesuaikan otomatis</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Paket">
                                <Select
                                    placeholder={paketOptions.length === 0 ? 'Tidak ada paket tersedia' : 'Pilih paket...'}
                                    isClearable
                                    options={paketOptions}
                                    value={selectedPaket}
                                    isDisabled={paketOptions.length === 0}
                                    onChange={(opt) => handlePaketChange(opt as SelectOption | null, selectedKelas?.value ?? null)}
                                />
                            </FormItem>

                            <FormItem label="Kategori Umur">
                                <Select
                                    placeholder={filteredKategori.length === 0 ? 'Tidak ada kategori tersedia' : 'Pilih kategori umur...'}
                                    isClearable
                                    options={filteredKategori}
                                    value={selectedKategori}
                                    isDisabled={filteredKategori.length === 0}
                                    onChange={(opt) => handleKategoriChange(opt as SelectOption | null, selectedPaket?.value ?? null, selectedKelas?.value ?? null)}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t mt-4 mb-4 border-gray-100 dark:border-gray-700" />

                    {/* Section: Tagihan */}
                    <div>
                        <div className="mb-4">
                            <h5 className="font-semibold">Tagihan &amp; Sesi</h5>
                            <p className="text-gray-500 text-sm mt-0.5">Pilih biaya yang berlaku — tagihan akan dibuat otomatis</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {/* Trial toggle */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    id="is_trial"
                                    checked={isTrial}
                                    onChange={(e) => { setIsTrial(e.target.checked); setSelectedBiaya(null); setError('') }}
                                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                                />
                                <label htmlFor="is_trial" className="cursor-pointer select-none">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Daftarkan sebagai Trial</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Gratis, tidak ada tagihan yang dibuat</p>
                                </label>
                            </div>

                            {!isTrial && (
                                <>
                                    {biayaList.length === 0 && selectedKelas ? (
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                                            <HiOutlineExclamationCircle className="text-lg text-amber-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                Tidak ada data biaya untuk kelas ini. Tambahkan di menu Master Biaya, atau daftarkan sebagai Trial.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            <FormItem
                                                label="Biaya / Tagihan"
                                                asterisk
                                                invalid={!!error && !selectedBiaya}
                                                errorMessage={!selectedBiaya ? error : ''}
                                            >
                                                <Select
                                                    placeholder={
                                                        !selectedKelas
                                                            ? 'Pilih kelas dulu...'
                                                            : biayaOptions.length === 0
                                                                ? 'Tidak ada biaya tersedia'
                                                                : 'Pilih biaya...'
                                                    }
                                                    options={biayaOptions}
                                                    value={selectedBiaya}
                                                    isDisabled={biayaOptions.length === 0}
                                                    onChange={(opt) => { setSelectedBiaya(opt as SelectOption | null); setError('') }}
                                                />
                                            </FormItem>

                                            <FormItem
                                                label={totalSesiAutoFilled ? 'Total Sesi (otomatis)' : 'Total Sesi'}
                                            >
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="Kosongkan jika tidak dibatasi"
                                                    value={totalSesi}
                                                    onChange={(e) => { setTotalSesi(e.target.value); setTotalSesiAutoFilled(false) }}
                                                />
                                            </FormItem>
                                        </div>
                                    )}
                                </>
                            )}

                            {isTrial && (
                                <FormItem
                                    label="Total Sesi"
                                    extra={totalSesiAutoFilled ? 'Diisi otomatis dari kategori umur' : 'Opsional — kosongkan jika tidak dibatasi'}
                                >
                                    <div className="md:w-1/2 md:pr-4">
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="Contoh: 16"
                                            value={totalSesi}
                                            onChange={(e) => { setTotalSesi(e.target.value); setTotalSesiAutoFilled(false) }}
                                        />
                                    </div>
                                </FormItem>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                            <HiOutlineExclamationCircle className="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => router.push(ROUTES.KURSUS_SISWA_DETAIL(id))}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="solid"
                            customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                            loading={submitting}
                            disabled={jadwalPenuh}
                            onClick={handleSubmit}
                        >
                            {isTrial ? 'Daftar Trial' : 'Assign & Buat Tagihan'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default AssignKelasPage
