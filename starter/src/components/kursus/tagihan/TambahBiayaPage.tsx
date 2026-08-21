'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, FormItem, Input, Select, Spinner, Notification, toast } from '@/components/ui'
import {
    HiArrowLeft,
    HiOutlineCollection,
    HiOutlineViewGrid,
    HiOutlineUsers,
    HiOutlineClock,
    HiOutlineTag,
    HiOutlineAcademicCap,
    HiOutlineClipboardCheck,
} from 'react-icons/hi'
import KelasService from '@/services/kursus/kelas.service'
import BiayaService from '@/services/kursus/biaya.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatNum, formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import { parseApiError } from '@/utils/parseApiError'
import { ROUTES } from '@/constants/route.constant'
import type { IKelas, IBiaya, IJadwalKelas, ITagihan } from '@/@types/kursus.types'

type KelasOption = { value: string; label: string; kelas: IKelas }
type BiayaOption = { value: string; label: string; biaya: IBiaya }
type JadwalOption = { value: string; label: string; jadwal: IJadwalKelas }
type JenisBiaya = 'KELAS' | 'PENDAFTARAN'

const JENIS_LABEL: Record<string, string> = {
    PENDAFTARAN: 'Pendaftaran',
    KELAS: 'Kelas',
    LAINNYA: 'Lainnya',
}

const TambahBiayaPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const idTagihan = searchParams.get('id') ?? ''

    const [tagihan, setTagihan] = useState<ITagihan | null>(null)
    const [loadingTagihan, setLoadingTagihan] = useState(true)

    const [jenis, setJenis] = useState<JenisBiaya>('KELAS')
    const [submitting, setSubmitting] = useState(false)
    const [hargaOverride, setHargaOverride] = useState('')
    const [errors, setErrors] = useState<{ kelas?: string; biaya?: string }>({})

    /* ── mode KELAS ── */
    const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)
    const [selectedKelas, setSelectedKelas] = useState<KelasOption | null>(null)
    const [biayaOptions, setBiayaOptions] = useState<BiayaOption[]>([])
    const [jadwalOptions, setJadwalOptions] = useState<JadwalOption[]>([])
    const [loadingBiayaJadwal, setLoadingBiayaJadwal] = useState(false)
    const [selectedBiaya, setSelectedBiaya] = useState<BiayaOption | null>(null)
    const [selectedJadwal, setSelectedJadwal] = useState<JadwalOption | null>(null)

    /* ── mode PENDAFTARAN ── */
    const [pendaftaranOptions, setPendaftaranOptions] = useState<BiayaOption[]>([])
    const [loadingPendaftaran, setLoadingPendaftaran] = useState(false)
    const [selectedPendaftaran, setSelectedPendaftaran] = useState<BiayaOption | null>(null)

    /* ── fetch tagihan context ── */
    const loadTagihan = useCallback(async () => {
        if (!idTagihan) { setLoadingTagihan(false); return }
        try {
            const res = await TagihanService.getById(idTagihan)
            if (res.success) setTagihan(res.data)
        } catch { /* biarkan null */ }
        finally { setLoadingTagihan(false) }
    }, [idTagihan])

    useEffect(() => { loadTagihan() }, [loadTagihan])

    /* ── fetch kelas list ── */
    const loadKelas = useCallback(async () => {
        setLoadingKelas(true)
        try {
            const res = await KelasService.getAll({ aktif: 1, limit: 500 })
            if (res.success)
                setKelasOptions(
                    res.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas, kelas: k })),
                )
        } catch { setKelasOptions([]) }
        finally { setLoadingKelas(false) }
    }, [])

    useEffect(() => { loadKelas() }, [loadKelas])

    /* ── fetch pendaftaran biaya list ── */
    const loadPendaftaran = useCallback(async () => {
        setLoadingPendaftaran(true)
        try {
            const res = await BiayaService.getAll({ limit: 200 })
            if (res.success) {
                const opts = res.data
                    .filter((b) => b.jenis_biaya === 'PENDAFTARAN' && b.aktif === 1)
                    .map((b) => ({
                        value: b.id_biaya,
                        label: `${b.nama_biaya} (Rp ${formatNum(b.harga_biaya)})`,
                        biaya: b,
                    }))
                setPendaftaranOptions(opts)
            }
        } catch { setPendaftaranOptions([]) }
        finally { setLoadingPendaftaran(false) }
    }, [])

    useEffect(() => { loadPendaftaran() }, [loadPendaftaran])

    /* ── load biaya + jadwal setelah kelas dipilih ── */
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
                        })),
                )
            if (jadwalRes.success)
                setJadwalOptions(
                    jadwalRes.data
                        .filter((j) => j.aktif === 1)
                        .map((j) => ({
                            value: j.id_jadwal_kelas,
                            label: `${j.hari} ${j.jam_mulai}-${j.jam_selesai} — ${j.nama_karyawan?.trim() || '(Tanpa Coach)'} (${j.kuota_terpakai}/${j.kuota ?? '∞'} siswa)`,
                            jadwal: j,
                        })),
                )
        } catch { /* biarkan kosong */ }
        finally { setLoadingBiayaJadwal(false) }
    }, [])

    const handleKelasChange = (opt: KelasOption | null) => {
        setSelectedKelas(opt)
        setSelectedBiaya(null)
        setSelectedJadwal(null)
        setHargaOverride('')
        setErrors({})
        if (opt) loadBiayaAndJadwal(opt.value)
    }

    const handleJenisChange = (val: JenisBiaya) => {
        setJenis(val)
        setSelectedKelas(null)
        setSelectedBiaya(null)
        setSelectedJadwal(null)
        setSelectedPendaftaran(null)
        setHargaOverride('')
        setErrors({})
        setBiayaOptions([])
        setJadwalOptions([])
    }

    /* ── submit ── */
    const validate = () => {
        const e: typeof errors = {}
        if (jenis === 'KELAS') {
            if (!selectedKelas) e.kelas = 'Pilih kelas terlebih dahulu'
            if (!selectedBiaya) e.biaya = 'Pilih biaya'
        } else {
            if (!selectedPendaftaran) e.biaya = 'Pilih biaya pendaftaran'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!idTagihan || !validate()) return
        const idBiaya =
            jenis === 'KELAS' ? selectedBiaya!.value : selectedPendaftaran!.value
        setSubmitting(true)
        try {
            const res = await TagihanService.addDetail(idTagihan, {
                id_biaya: idBiaya,
                ...(jenis === 'KELAS' && selectedJadwal
                    ? { id_jadwal_kelas: selectedJadwal.value }
                    : {}),
                ...(hargaOverride ? { harga_akhir: parseRupiah(hargaOverride) } : {}),
            })
            if (res.success) {
                toast.push(<Notification type="success" title="Baris biaya berhasil ditambahkan" />)
                router.push(`${ROUTES.KURSUS_TAGIHAN_CATAT_PEMBAYARAN}?id=${idTagihan}`)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menambah biaya">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false) }
    }

    const goBack = () =>
        router.push(`${ROUTES.KURSUS_TAGIHAN_CATAT_PEMBAYARAN}?id=${idTagihan}`)

    const b = jenis === 'KELAS' ? selectedBiaya?.biaya : selectedPendaftaran?.biaya
    const j = selectedJadwal?.jadwal

    const selectedHarga = b?.harga_biaya ?? 0
    const activeOption = jenis === 'KELAS' ? selectedBiaya : selectedPendaftaran

    if (!idTagihan) {
        return (
            <div className="flex flex-col items-center gap-2 py-20 text-gray-400">
                <p className="text-sm">ID Tagihan tidak ditemukan</p>
                <Button variant="plain" size="sm" onClick={() => router.push(ROUTES.KURSUS_TAGIHAN)}>
                    Kembali ke Tagihan
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h3 className="font-bold">Tambah Baris Biaya</h3>
                    {loadingTagihan ? (
                        <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1">
                            <Spinner size={12} /> Memuat tagihan…
                        </p>
                    ) : tagihan ? (
                        <p className="text-gray-500 text-sm mt-0.5">
                            Tagihan:{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                {tagihan.nama_siswa}
                            </span>
                        </p>
                    ) : null}
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-5">

                    {/* ── Toggle jenis biaya ── */}
                    <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                            Jenis Biaya
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {(
                                [
                                    {
                                        val: 'KELAS' as JenisBiaya,
                                        icon: <HiOutlineAcademicCap className="text-xl" />,
                                        title: 'Biaya Kelas',
                                        desc: 'Tarif kelas, paket, atau kategori umur',
                                    },
                                    {
                                        val: 'PENDAFTARAN' as JenisBiaya,
                                        icon: <HiOutlineClipboardCheck className="text-xl" />,
                                        title: 'Biaya Pendaftaran',
                                        desc: 'Biaya administrasi pendaftaran siswa',
                                    },
                                ] as const
                            ).map(({ val, icon, title, desc }) => {
                                const active = jenis === val
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleJenisChange(val)}
                                        className={[
                                            'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                                            active
                                                ? 'border-[#2a85ff] bg-[#E9F3FF] dark:bg-[#E9F3FF]/10'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-600',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'mt-0.5 shrink-0',
                                                active
                                                    ? 'text-[#2a85ff]'
                                                    : 'text-gray-400 dark:text-gray-500',
                                            ].join(' ')}
                                        >
                                            {icon}
                                        </span>
                                        <div>
                                            <p
                                                className={[
                                                    'text-sm font-semibold leading-tight',
                                                    active
                                                        ? 'text-[#2a85ff]'
                                                        : 'text-gray-700 dark:text-gray-200',
                                                ].join(' ')}
                                            >
                                                {title}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {desc}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Form: mode KELAS ── */}
                    {jenis === 'KELAS' && (
                        <>
                            <FormItem
                                label="Kelas"
                                asterisk
                                invalid={!!errors.kelas}
                                errorMessage={errors.kelas}
                            >
                                <Select<KelasOption>
                                    placeholder={loadingKelas ? 'Memuat kelas…' : 'Pilih kelas'}
                                    isDisabled={loadingKelas}
                                    options={kelasOptions}
                                    value={selectedKelas}
                                    onChange={(opt) => handleKelasChange(opt as KelasOption | null)}
                                    isClearable
                                />
                            </FormItem>

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
                                                setHargaOverride(
                                                    sel ? formatNum(sel.biaya.harga_biaya) : '',
                                                )
                                            }}
                                            isClearable
                                        />
                                    )}
                                </FormItem>
                            )}

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
                                            onChange={(opt) =>
                                                setSelectedJadwal(opt as JadwalOption | null)
                                            }
                                            isClearable
                                        />
                                    )}
                                </FormItem>
                            )}
                        </>
                    )}

                    {/* ── Form: mode PENDAFTARAN ── */}
                    {jenis === 'PENDAFTARAN' && (
                        <FormItem
                            label="Biaya Pendaftaran"
                            asterisk
                            invalid={!!errors.biaya}
                            errorMessage={errors.biaya}
                        >
                            {loadingPendaftaran ? (
                                <div className="flex items-center gap-2 h-10 text-sm text-gray-400">
                                    <Spinner size={14} /> Memuat biaya pendaftaran…
                                </div>
                            ) : pendaftaranOptions.length === 0 ? (
                                <p className="h-10 flex items-center text-sm text-gray-400">
                                    Tidak ada biaya pendaftaran aktif
                                </p>
                            ) : (
                                <Select<BiayaOption>
                                    placeholder="Pilih biaya pendaftaran"
                                    options={pendaftaranOptions}
                                    value={selectedPendaftaran}
                                    onChange={(opt) => {
                                        const sel = opt as BiayaOption | null
                                        setSelectedPendaftaran(sel)
                                        setHargaOverride(
                                            sel ? formatNum(sel.biaya.harga_biaya) : '',
                                        )
                                    }}
                                    isClearable
                                />
                            )}
                        </FormItem>
                    )}

                    {/* ── Info card ringkasan ── */}
                    {(b?.nama_kelas || b?.nama_paket || b?.nama_kategori_umur || j) && (
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
                                    <span className="font-medium">
                                        {j.hari} {j.jam_mulai}-{j.jam_selesai}
                                    </span>
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

                    {/* ── Override harga ── */}
                    {activeOption && (
                        <FormItem label="Override Harga (opsional)">
                            <Input
                                prefix={<span className="text-gray-500 font-medium">Rp</span>}
                                placeholder={`Default: Rp ${formatNum(selectedHarga)}`}
                                value={hargaOverride}
                                onChange={(e) =>
                                    setHargaOverride(formatRupiahInput(e.target.value))
                                }
                            />
                        </FormItem>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={goBack}
                        disabled={submitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="solid"
                        customColorClass={() =>
                            'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                        }
                        loading={submitting}
                        disabled={!activeOption}
                        onClick={handleSubmit}
                    >
                        Tambah Biaya
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default TambahBiayaPage
