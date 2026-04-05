'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import KelasService from '@/services/kursus/kelas.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import type { ISiswa, IKelas, IKategoriUmur } from '@/@types/kursus.types'

interface AssignKelasModalProps {
    isOpen: boolean
    siswa: ISiswa | null
    onClose: () => void
    onSuccess: () => void
}

type SelectOption = { value: string; label: string }

const AssignKelasModal = ({ isOpen, siswa, onClose, onSuccess }: AssignKelasModalProps) => {
    const [kelasList, setKelasList] = useState<SelectOption[]>([])
    const [kategoriList, setKategoriList] = useState<IKategoriUmur[]>([])

    const [selectedKelas, setSelectedKelas] = useState<SelectOption | null>(null)
    const [selectedPaket, setSelectedPaket] = useState<SelectOption | null>(null)
    const [selectedKategori, setSelectedKategori] = useState<SelectOption | null>(null)
    const [totalSesi, setTotalSesi] = useState('')
    const [totalSesiAutoFilled, setTotalSesiAutoFilled] = useState(false)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Reset on open
    useEffect(() => {
        if (!isOpen) return
        setSelectedKelas(null)
        setSelectedPaket(null)
        setSelectedKategori(null)
        setKategoriList([])
        setTotalSesi('')
        setTotalSesiAutoFilled(false)
        setError('')

        KelasService.getAll({ aktif: 1, limit: 200 }).then((res) => {
            setKelasList(res.data.map((k: IKelas) => ({ value: k.id_kelas, label: k.nama_kelas })))
        }).catch(() => { })
    }, [isOpen])

    // When kelas changes → load kategori umur, reset paket & kategori
    const handleKelasChange = async (opt: SelectOption | null) => {
        setSelectedKelas(opt)
        setSelectedPaket(null)
        setSelectedKategori(null)
        setKategoriList([])
        setTotalSesi('')
        setTotalSesiAutoFilled(false)
        setError('')
        if (!opt) return
        try {
            const res = await KategoriUmurService.getByKelas(opt.value)
            setKategoriList(res.data)
        } catch {
            // kategori umur tidak tersedia — tetap bisa submit
        }
    }

    // Derive unique paket options from loaded kategori umur
    const paketOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>()
        kategoriList.forEach((k) => {
            if (k.id_paket && k.nama_paket) map.set(k.id_paket, k.nama_paket)
        })
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    }, [kategoriList])

    // Filtered kategori umur based on selected paket
    const filteredKategori = useMemo<SelectOption[]>(() => {
        const list = selectedPaket
            ? kategoriList.filter((k) => k.id_paket === selectedPaket.value)
            : kategoriList
        return list.map((k) => ({
            value: k.id_kategori_umur,
            label: k.nama_kategori_umur + (k.sesi_pertemuan ? ` (${k.sesi_pertemuan} sesi)` : ''),
        }))
    }, [kategoriList, selectedPaket])

    // When kategori umur changes → auto-fill total_sesi from sesi_pertemuan
    const handleKategoriChange = (opt: SelectOption | null) => {
        setSelectedKategori(opt)
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
        setSubmitting(true)
        setError('')
        try {
            await CatatKelasSiswaService.create({
                id_siswa: siswa.id_siswa,
                id_kelas: selectedKelas.value,
                ...(totalSesi !== '' ? { total_sesi: Number(totalSesi) } : {}),
            })
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Gagal input kelas'
            setError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={480}>
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

                {/* Paket — muncul setelah kelas dipilih dan ada paket tersedia */}
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
                                if (totalSesiAutoFilled) { setTotalSesi(''); setTotalSesiAutoFilled(false) }
                            }}
                        />
                    </FormItem>
                )}

                {/* Kategori Umur — muncul setelah kelas dipilih */}
                {selectedKelas && filteredKategori.length > 0 && (
                    <FormItem
                        label="Kategori Umur"
                        extra="Opsional — total sesi akan diisi otomatis"
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

                {error && selectedKelas && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    Assign
                </Button>
            </div>
        </Dialog>
    )
}

export default AssignKelasModal
