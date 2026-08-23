'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Dialog, FormItem, Input, Select, Spinner, Notification, toast } from '@/components/ui'
import { HiOutlineCollection, HiOutlineViewGrid, HiOutlineUsers, HiOutlineClock, HiOutlineTag } from 'react-icons/hi'
import KelasService from '@/services/kursus/kelas.service'
import BiayaService from '@/services/kursus/biaya.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatNum, formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import { parseApiError } from '@/utils/parseApiError'
import type { IKelas, IBiaya, IJadwalKelas, ITagihan } from '@/@types/kursus.types'

/* ─── option types ───────────────────────────────────────── */

type KelasOption = { value: string; label: string; kelas: IKelas }
type BiayaOption = { value: string; label: string; biaya: IBiaya }
type JadwalOption = { value: string; label: string; jadwal: IJadwalKelas }

const JENIS_LABEL: Record<string, string> = {
    PENDAFTARAN: 'Pendaftaran',
    KELAS: 'Kelas',
    LAINNYA: 'Lainnya',
}

/* ─── props ──────────────────────────────────────────────── */

interface TambahDetailFormProps {
    open: boolean
    tagihan: ITagihan | null
    onClose: () => void
    onSaved: (updated: ITagihan) => void
}

/* ─── component ──────────────────────────────────────────── */

const TambahDetailForm = ({ open, tagihan, onClose, onSaved }: TambahDetailFormProps) => {
    const [submitting, setSubmitting] = useState(false)
    const [hargaOverride, setHargaOverride] = useState('')

    /* ── mode: dari master biaya, atau biaya lainnya diketik manual ── */
    const [mode, setMode] = useState<'master' | 'manual'>('master')
    const [namaManual, setNamaManual] = useState('')
    const [hargaManual, setHargaManual] = useState('')

    const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)
    const [selectedKelas, setSelectedKelas] = useState<KelasOption | null>(null)

    const [biayaOptions, setBiayaOptions] = useState<BiayaOption[]>([])
    const [jadwalOptions, setJadwalOptions] = useState<JadwalOption[]>([])
    const [loadingBiayaJadwal, setLoadingBiayaJadwal] = useState(false)
    const [selectedBiaya, setSelectedBiaya] = useState<BiayaOption | null>(null)
    const [selectedJadwal, setSelectedJadwal] = useState<JadwalOption | null>(null)

    const [errors, setErrors] = useState<{ kelas?: string; biaya?: string; nama?: string; harga?: string }>({})

    const loadKelas = useCallback(async () => {
        setLoadingKelas(true)
        try {
            const res = await KelasService.getAll({ aktif: 1, limit: 500 })
            if (res.success)
                setKelasOptions(
                    res.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas, kelas: k }))
                )
        } catch {
            setKelasOptions([])
        } finally {
            setLoadingKelas(false)
        }
    }, [])

    const loadBiayaAndJadwal = useCallback(async (idKelas: string) => {
        setLoadingBiayaJadwal(true)
        setBiayaOptions([])
        setJadwalOptions([])
        try {
            const [biayaRes, jadwalRes] = await Promise.all([
                BiayaService.getByKelas(idKelas),
                JadwalKelasService.getByKelas(idKelas),
            ])
            if (biayaRes.success)
                setBiayaOptions(
                    biayaRes.data
                        .filter((b) => b.aktif === 1)
                        .map((b) => ({
                            value: b.id_biaya,
                            label: [
                                `[${JENIS_LABEL[b.jenis_biaya] ?? b.jenis_biaya}]`,
                                b.nama_biaya,
                                b.nama_paket ? `· ${b.nama_paket}` : '',
                                b.nama_kategori_umur ? `· ${b.nama_kategori_umur}` : '',
                                `(Rp ${formatNum(b.harga_biaya)})`,
                            ].filter(Boolean).join(' '),
                            biaya: b,
                        }))
                )
            if (jadwalRes.success)
                setJadwalOptions(
                    jadwalRes.data
                        .filter((j) => j.aktif === 1)
                        .map((j) => ({
                            value: j.id_jadwal_kelas,
                            label: `${j.hari} ${j.jam_mulai}-${j.jam_selesai} — ${j.nama_karyawan?.trim() || '(Tanpa Coach)'} (${j.kuota_terpakai}/${j.kuota ?? '∞'} siswa)`,
                            jadwal: j,
                        }))
                )
        } catch {
            // biarkan kosong, user bisa pilih tanpa jadwal
        } finally {
            setLoadingBiayaJadwal(false)
        }
    }, [])

    useEffect(() => {
        if (open) {
            setSelectedKelas(null)
            setSelectedBiaya(null)
            setSelectedJadwal(null)
            setBiayaOptions([])
            setJadwalOptions([])
            setHargaOverride('')
            setMode('master')
            setNamaManual('')
            setHargaManual('')
            setErrors({})
            loadKelas()
        }
    }, [open, loadKelas])

    const handleKelasChange = (opt: KelasOption | null) => {
        setSelectedKelas(opt)
        setSelectedBiaya(null)
        setSelectedJadwal(null)
        setHargaOverride('')
        if (opt) loadBiayaAndJadwal(opt.value)
    }

    const validate = () => {
        const e: typeof errors = {}
        if (mode === 'manual') {
            if (!namaManual.trim()) e.nama = 'Isi nama biaya'
            if (!hargaManual || parseRupiah(hargaManual) <= 0) e.harga = 'Isi harga yang valid'
        } else {
            if (!selectedKelas) e.kelas = 'Pilih kelas terlebih dahulu'
            if (!selectedBiaya) e.biaya = 'Pilih biaya'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!tagihan || !validate()) return
        setSubmitting(true)
        try {
            const payload =
                mode === 'manual'
                    ? { nama_biaya: namaManual.trim(), harga_akhir: parseRupiah(hargaManual) }
                    : {
                          id_biaya: selectedBiaya!.value,
                          ...(selectedJadwal ? { id_jadwal_kelas: selectedJadwal.value } : {}),
                          ...(hargaOverride ? { harga_akhir: parseRupiah(hargaOverride) } : {}),
                      }
            const res = await TagihanService.addDetail(tagihan.id_tagihan, payload)
            if (res.success) {
                toast.push(<Notification type="success" title="Baris biaya berhasil ditambahkan" />)
                onSaved(res.data)
                onClose()
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menambah biaya">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const b = selectedBiaya?.biaya
    const j = selectedJadwal?.jadwal

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={520}>
            <h5 className="mb-6">Tambah Baris Biaya</h5>
            <div className="flex flex-col gap-4">

                {/* Sumber biaya: master atau ketik manual */}
                <div className="grid grid-cols-2 gap-2">
                    {([
                        { val: 'master' as const, label: 'Dari Master Biaya' },
                        { val: 'manual' as const, label: 'Biaya Lainnya (ketik manual)' },
                    ]).map(({ val, label }) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => { setMode(val); setErrors({}) }}
                            className={[
                                'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                                mode === val
                                    ? 'border-[#2a85ff] bg-[#E9F3FF] text-[#2a85ff] dark:bg-[#E9F3FF]/10'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300',
                            ].join(' ')}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {mode === 'manual' && (
                    <>
                        <FormItem label="Nama Biaya" asterisk invalid={!!errors.nama} errorMessage={errors.nama}>
                            <Input
                                placeholder="Mis. Seragam tari, Kostum pentas"
                                value={namaManual}
                                maxLength={100}
                                onChange={(e) => setNamaManual(e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Harga" asterisk invalid={!!errors.harga} errorMessage={errors.harga}>
                            <Input
                                prefix={<span className="text-gray-500 font-medium">Rp</span>}
                                placeholder="0"
                                value={hargaManual}
                                onChange={(e) => setHargaManual(formatRupiahInput(e.target.value))}
                            />
                        </FormItem>
                    </>
                )}

                {/* Step 1: Kelas */}
                {mode === 'master' && (
                <FormItem label="Kelas" asterisk invalid={!!errors.kelas} errorMessage={errors.kelas}>
                    <Select<KelasOption>
                        placeholder={loadingKelas ? 'Memuat kelas…' : 'Pilih kelas'}
                        isDisabled={loadingKelas}
                        options={kelasOptions}
                        value={selectedKelas}
                        onChange={(opt) => handleKelasChange(opt as KelasOption | null)}
                        isClearable
                    />
                </FormItem>
                )}

                {/* Step 2: Biaya (muncul setelah kelas dipilih) */}
                {selectedKelas && (
                    <FormItem
                        label="Biaya / Paket / Kategori Umur"
                        asterisk
                        invalid={!!errors.biaya}
                        errorMessage={errors.biaya}
                    >
                        {loadingBiayaJadwal ? (
                            <div className="flex items-center gap-2 h-10 text-sm text-gray-400">
                                <Spinner size={14} /> Memuat opsi biaya…
                            </div>
                        ) : biayaOptions.length === 0 ? (
                            <p className="h-10 flex items-center text-sm text-gray-400">
                                Tidak ada biaya aktif untuk kelas ini
                            </p>
                        ) : (
                            <Select<BiayaOption>
                                placeholder="Pilih biaya"
                                options={biayaOptions}
                                value={selectedBiaya}
                                onChange={(opt) => {
                                    const sel = opt as BiayaOption | null
                                    setSelectedBiaya(sel)
                                    setHargaOverride(sel ? formatNum(sel.biaya.harga_biaya) : '')
                                }}
                                isClearable
                            />
                        )}
                    </FormItem>
                )}

                {/* Step 3: Jadwal (muncul setelah kelas dipilih) */}
                {selectedKelas && (
                    <FormItem label="Jadwal (opsional)">
                        {loadingBiayaJadwal ? (
                            <div className="flex items-center gap-2 h-10 text-sm text-gray-400">
                                <Spinner size={14} /> Memuat jadwal…
                            </div>
                        ) : jadwalOptions.length === 0 ? (
                            <p className="h-10 flex items-center text-sm text-gray-400">
                                Tidak ada jadwal aktif untuk kelas ini
                            </p>
                        ) : (
                            <Select<JadwalOption>
                                placeholder="— Pilih jadwal (opsional) —"
                                options={jadwalOptions}
                                value={selectedJadwal}
                                onChange={(opt) => setSelectedJadwal(opt as JadwalOption | null)}
                                isClearable
                            />
                        )}
                    </FormItem>
                )}

                {/* Info card: ringkasan pilihan */}
                {(b || j) && (
                    <div className="rounded-xl border border-[#d0e6ff] dark:border-[#E9F3FF]/20 bg-[#E9F3FF]/60 dark:bg-[#E9F3FF]/10 px-4 py-3 flex flex-wrap gap-x-5 gap-y-2">
                        {b?.nama_kelas && (
                            <div className="flex items-center gap-1.5 text-xs text-[#2a85ff] dark:text-[#7BB8FF]">
                                <HiOutlineCollection className="shrink-0" />
                                <span className="font-medium">{b.nama_kelas}</span>
                            </div>
                        )}
                        {b?.nama_paket && (
                            <div className="flex items-center gap-1.5 text-xs text-[#2a85ff] dark:text-[#7BB8FF]">
                                <HiOutlineViewGrid className="shrink-0" />
                                <span className="font-medium">{b.nama_paket}</span>
                            </div>
                        )}
                        {b?.nama_kategori_umur && (
                            <div className="flex items-center gap-1.5 text-xs text-[#2a85ff] dark:text-[#7BB8FF]">
                                <HiOutlineUsers className="shrink-0" />
                                <span className="font-medium">{b.nama_kategori_umur}</span>
                            </div>
                        )}
                        {j && (
                            <div className="flex items-center gap-1.5 text-xs text-[#2a85ff] dark:text-[#7BB8FF]">
                                <HiOutlineClock className="shrink-0" />
                                <span className="font-medium">{j.hari} {j.jam_mulai}-{j.jam_selesai}</span>
                            </div>
                        )}
                        {j?.nama_karyawan && (
                            <div className="flex items-center gap-1.5 text-xs text-[#2a85ff] dark:text-[#7BB8FF]">
                                <HiOutlineTag className="shrink-0" />
                                <span className="font-medium">{j.nama_karyawan}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Override harga (muncul setelah biaya dipilih) */}
                {selectedBiaya && (
                    <FormItem label="Override Harga (opsional)">
                        <Input
                            prefix={<span className="text-gray-500 font-medium">Rp</span>}
                            placeholder="Kosongkan untuk pakai harga biaya"
                            value={hargaOverride}
                            onChange={(e) => setHargaOverride(formatRupiahInput(e.target.value))}
                        />
                    </FormItem>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button
                    type="button"
                    variant="solid"
                    customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                    loading={submitting}
                    disabled={mode === 'manual' ? !namaManual.trim() || !hargaManual : !selectedBiaya}
                    onClick={handleSubmit}
                >
                    Tambah
                </Button>
            </div>
        </Dialog>
    )
}

export default TambahDetailForm
