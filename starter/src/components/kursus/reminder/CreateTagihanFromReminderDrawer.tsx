'use client'

import { useState, useEffect } from 'react'
import { Button, Drawer, Input, Notification, Select, Spinner, toast } from '@/components/ui'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiah, formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import type { IBiaya } from '@/@types/kursus.types'

/* ─── types ──────────────────────────────────────────────── */

interface SelectOption {
    value: string
    label: string
}

interface EnrollmentItem {
    id_catat: string
    id_kelas: string
    nama_kelas: string | null
}

interface Props {
    open: boolean
    onClose: () => void
    idSiswa: string
    namaSiswa: string
    idKelas: string
    namaKelas: string
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

/* ─── component ──────────────────────────────────────────── */

export default function CreateTagihanFromReminderDrawer({
    open,
    onClose,
    idSiswa,
    namaSiswa,
    idKelas,
    namaKelas,
    onSuccess,
}: Props) {
    const [kelasOptions, setKelasOptions] = useState<SelectOption[]>([])
    const [selectedKelasId, setSelectedKelasId] = useState(idKelas)
    const [selectedKelasNama, setSelectedKelasNama] = useState(namaKelas)
    const [loadingKelas, setLoadingKelas] = useState(false)

    const [biayaList, setBiayaList] = useState<IBiaya[]>([])
    const [biayaOptions, setBiayaOptions] = useState<SelectOption[]>([])
    const [selectedBiayaId, setSelectedBiayaId] = useState<string | null>(null)
    const [loadingBiaya, setLoadingBiaya] = useState(false)

    const [periodeLabel, setPeriodeLabel] = useState('')
    const [nominalHarga, setNominalHarga] = useState('')
    const [deskripsi, setDeskripsi] = useState('')
    const [loading, setLoading] = useState(false)

    /* ─── fetch kelas history on open ─────────────────────── */

    useEffect(() => {
        if (!open || !idSiswa) return
        setSelectedKelasId(idKelas)
        setSelectedKelasNama(namaKelas)

        const fetchKelas = async () => {
            setLoadingKelas(true)
            try {
                const res = await ApiService.fetchDataWithAxios<{ data: EnrollmentItem[] }>({
                    url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BY_SISWA(idSiswa),
                    method: 'GET',
                })
                const seen = new Set<string>()
                const unique: SelectOption[] = []
                for (const item of res.data ?? []) {
                    if (item.id_kelas && !seen.has(item.id_kelas)) {
                        seen.add(item.id_kelas)
                        unique.push({ value: item.id_kelas, label: item.nama_kelas ?? item.id_kelas })
                    }
                }
                if (!seen.has(idKelas)) {
                    unique.unshift({ value: idKelas, label: namaKelas })
                }
                setKelasOptions(unique)
            } catch {
                setKelasOptions([{ value: idKelas, label: namaKelas }])
            } finally {
                setLoadingKelas(false)
            }
        }
        fetchKelas()
    }, [open, idSiswa, idKelas, namaKelas])

    /* ─── fetch biaya when kelas changes ──────────────────── */

    useEffect(() => {
        if (!selectedKelasId) return
        const fetchBiaya = async () => {
            setLoadingBiaya(true)
            setBiayaList([])
            setBiayaOptions([])
            setSelectedBiayaId(null)
            setNominalHarga('')
            try {
                const res = await ApiService.fetchDataWithAxios<{ data: IBiaya[] }>({
                    url: API_ENDPOINTS.KURSUS.BIAYA.BY_KELAS(selectedKelasId),
                    method: 'GET',
                })
                const list = res.data ?? []
                setBiayaList(list)
                setBiayaOptions(
                    list.map((b) => ({
                        value: b.id_biaya,
                        label: `${b.nama_biaya} — ${formatRupiah(b.harga_biaya)}`,
                    })),
                )
                const first = list.find((b) => b.jenis_biaya === 'KELAS') ?? list[0]
                if (first) {
                    setSelectedBiayaId(first.id_biaya)
                    setNominalHarga(formatRupiahInput(String(first.harga_biaya)))
                }
            } catch {
                /* no biaya for this kelas */
            } finally {
                setLoadingBiaya(false)
            }
        }
        fetchBiaya()
    }, [selectedKelasId])

    /* ─── handlers ────────────────────────────────────────── */

    const handleKelasChange = (opt: SelectOption | null) => {
        if (!opt) return
        setSelectedKelasId(opt.value)
        setSelectedKelasNama(opt.label)
    }

    const handleBiayaChange = (opt: SelectOption | null) => {
        if (!opt) return
        setSelectedBiayaId(opt.value)
        const found = biayaList.find((b) => b.id_biaya === opt.value)
        if (found) setNominalHarga(formatRupiahInput(String(found.harga_biaya)))
    }

    const handleClose = () => {
        setPeriodeLabel('')
        setNominalHarga('')
        setDeskripsi('')
        setSelectedBiayaId(null)
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await ApiService.fetchDataWithAxios<CreateTagihanResponse, CreateTagihanPayload>({
                url: API_ENDPOINTS.KURSUS.TAGIHAN.BASE,
                method: 'POST',
                data: {
                    id_siswa: idSiswa,
                    nama_siswa: namaSiswa,
                    nama_tagihan: `Perpanjangan ${selectedKelasNama} - ${periodeLabel}`,
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

    /* ─── render ──────────────────────────────────────────── */

    return (
        <Drawer
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
            title="Generate Tagihan Perpanjangan"
            width={440}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-4">
                {/* Nama Siswa */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Siswa
                    </label>
                    <Input value={namaSiswa} readOnly disabled />
                </div>

                {/* Pilih Kelas */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kelas <span className="text-red-500">*</span>
                    </label>
                    {loadingKelas ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                            <Spinner size={16} />
                            Memuat riwayat kelas...
                        </div>
                    ) : (
                        <Select<SelectOption>
                            options={kelasOptions}
                            value={kelasOptions.find((o) => o.value === selectedKelasId) ?? null}
                            onChange={handleKelasChange}
                            placeholder="Pilih kelas"
                        />
                    )}
                </div>

                {/* Pilih Paket Biaya */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Paket Biaya <span className="text-red-500">*</span>
                    </label>
                    {loadingBiaya ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                            <Spinner size={16} />
                            Memuat biaya kelas...
                        </div>
                    ) : biayaOptions.length === 0 && !loadingBiaya ? (
                        <p className="py-1 text-sm italic text-gray-400">
                            Tidak ada biaya terdaftar untuk kelas ini
                        </p>
                    ) : (
                        <Select<SelectOption>
                            options={biayaOptions}
                            value={biayaOptions.find((o) => o.value === selectedBiayaId) ?? null}
                            onChange={handleBiayaChange}
                            placeholder="Pilih paket biaya"
                        />
                    )}
                </div>

                {/* Periode */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Periode <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: Juni 2026 / Paket 10x"
                        value={periodeLabel}
                        onChange={(e) => setPeriodeLabel(e.target.value)}
                        required
                    />
                </div>

                {/* Nominal (auto dari biaya, bisa diubah) */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nominal <span className="text-red-500">*</span>
                        {selectedBiayaId && (
                            <span className="ml-1 text-xs font-normal text-gray-400">
                                (dari paket biaya, bisa diubah)
                            </span>
                        )}
                    </label>
                    <Input
                        prefix={<span className="font-medium text-gray-500">Rp</span>}
                        placeholder="0"
                        value={nominalHarga}
                        onChange={(e) => setNominalHarga(formatRupiahInput(e.target.value))}
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
                        disabled={!periodeLabel || !nominalHarga || !selectedKelasId}
                    >
                        Generate Tagihan
                    </Button>
                </div>
            </form>
        </Drawer>
    )
}
