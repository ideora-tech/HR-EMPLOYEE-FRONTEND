'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, FormItem, Input, Select, Notification, toast } from '@/components/ui'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ISiswaKelasItem } from '@/@types/kursus.types'

type SelectOption = { value: string; label: string }

const STATUS_OPTIONS: SelectOption[] = [
    { value: '1', label: 'Berjalan' },
    { value: '0', label: 'Selesai' },
]

interface EditKelasModalProps {
    isOpen: boolean
    item: ISiswaKelasItem | null
    onClose: () => void
    onSuccess: () => void
}

const EditKelasModal = ({ isOpen, item, onClose, onSuccess }: EditKelasModalProps) => {
    const [totalSesi, setTotalSesi] = useState<string>('')
    const [status, setStatus] = useState<SelectOption>(STATUS_OPTIONS[0])
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (item) {
            setTotalSesi(item.total_sesi !== null ? String(item.total_sesi) : '')
            setStatus(STATUS_OPTIONS.find(o => o.value === String(item.status)) ?? STATUS_OPTIONS[0])
        }
    }, [item])

    const handleSubmit = async () => {
        if (!item) return
        setSubmitting(true)
        try {
            const totalSesiNum = totalSesi.trim() === '' ? null : Number(totalSesi)
            await CatatKelasSiswaService.update(item.id_catat, {
                total_sesi: totalSesiNum,
                status: Number(status.value) as 0 | 1,
            })
            toast.push(<Notification type="success" title="Data kelas berhasil diperbarui" />)
            onSuccess()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memperbarui data kelas">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={440}>
            <h5 className="mb-1">Ubah Data Kelas</h5>
            {item && (
                <p className="text-sm text-gray-500 mb-5">
                    {item.nama_kelas}
                    {item.hari ? ` — ${item.hari}${item.jam_mulai ? `, ${item.jam_mulai}–${item.jam_selesai}` : ''}` : ''}
                </p>
            )}
            <div className="flex flex-col gap-4">
                <FormItem label="Total Sesi" hint="Kosongkan jika tidak terbatas">
                    <Input
                        type="number"
                        min={0}
                        placeholder="contoh: 12"
                        value={totalSesi}
                        onChange={(e) => setTotalSesi(e.target.value)}
                    />
                </FormItem>
                <FormItem label="Status">
                    <Select<SelectOption>
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={(opt) => setStatus(opt as SelectOption)}
                    />
                </FormItem>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    Simpan Perubahan
                </Button>
            </div>
        </Dialog>
    )
}

export default EditKelasModal
