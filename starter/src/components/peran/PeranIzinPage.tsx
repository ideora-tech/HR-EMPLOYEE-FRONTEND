'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Card, Input, Notification, Spinner, toast } from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import PermissionMatrix from '@/components/shared/PermissionMatrix'
import PeranService from '@/services/peran.service'
import IzinService from '@/services/izin.service'
import useIzin from '@/utils/hooks/useIzin'
import { parseApiError } from '@/utils/parseApiError'
import { ROUTES } from '@/constants/route.constant'
import type { IItemIzin, IPeran } from '@/@types/peran.types'

interface Props {
    idPeran: string
}

/**
 * Atur nama & izin satu peran lewat matriks (rombak RBAC, mengikuti POS_IDEORA).
 * Owner terkunci: otomatis memegang semua izin paket. Izin yang tidak dimiliki pelaku ditolak backend.
 */
const PeranIzinPage = ({ idPeran }: Props) => {
    const router = useRouter()
    const { punya, superAdmin } = useIzin()
    const [peran, setPeran] = useState<IPeran | null>(null)
    const [katalog, setKatalog] = useState<IItemIzin[]>([])
    const [nama, setNama] = useState('')
    const [izin, setIzin] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const muat = useCallback(async () => {
        setLoading(true)
        try {
            const [resPeran, resKatalog] = await Promise.all([PeranService.getById(idPeran), IzinService.getKatalog()])
            setPeran(resPeran.data)
            setNama(resPeran.data.nama_peran)
            setIzin(resPeran.data.kode_izin ?? [])
            setKatalog(resKatalog.data)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoading(false)
        }
    }, [idPeran])

    useEffect(() => {
        muat()
    }, [muat])

    const isOwner = peran?.is_sistem === 1
    const bolehUbah = punya('peran.update') && !isOwner
    // Owner memegang semua izin paket: tampilkan seluruh katalog tercentang.
    const nilaiMatriks = useMemo(() => (isOwner ? katalog.map((k) => k.kode) : izin), [isOwner, katalog, izin])

    const simpan = async () => {
        if (!peran) return
        setSaving(true)
        try {
            await PeranService.update(peran.id_peran, { nama_peran: nama.trim(), kode_izin: izin })
            toast.push(<Notification type="success" title="Izin peran berhasil disimpan" />)
            await muat()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size={36} />
            </div>
        )
    }
    if (!peran) return null

    return (
        <Card>
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Button size="sm" variant="plain" icon={<HiArrowLeft />} onClick={() => router.push(ROUTES.PERAN)} />
                        <div>
                            <h4>Atur Izin Peran</h4>
                            <p className="text-sm text-gray-500">Kode: {peran.kode_peran}</p>
                        </div>
                    </div>
                    {bolehUbah && (
                        <div className="flex gap-2">
                            <Button size="sm" disabled={saving} onClick={() => setIzin(peran.kode_izin ?? [])}>
                                Batalkan Perubahan
                            </Button>
                            <Button size="sm" variant="solid" loading={saving} disabled={!nama.trim()} onClick={simpan}>
                                Simpan
                            </Button>
                        </div>
                    )}
                </div>

                {isOwner && (
                    <Alert showIcon type="info">
                        Peran Owner adalah peran bawaan: otomatis memegang semua izin yang ada di paket langganan dan tidak bisa diubah.
                    </Alert>
                )}

                {!isOwner && !bolehUbah && (
                    <Alert showIcon type="info">
                        {superAdmin
                            ? 'Hanya bisa dilihat: peran perusahaan diatur oleh Owner perusahaan. Login dengan akun Owner untuk mengubahnya.'
                            : 'Hanya bisa dilihat: Anda tidak punya izin mengubah peran.'}
                    </Alert>
                )}

                <div className="max-w-md">
                    <label className="text-sm font-semibold mb-1 block">Nama Peran</label>
                    <Input value={nama} disabled={!bolehUbah} onChange={(e) => setNama(e.target.value)} />
                </div>

                <p className="text-sm text-gray-500">
                    Mencentang <span className="font-semibold">Lihat</span> menentukan apakah menu tampil di sidebar.
                    Hanya izin yang tersedia di paket langganan yang muncul di sini.
                </p>

                <PermissionMatrix catalog={katalog} value={nilaiMatriks} onChange={setIzin} disabled={!bolehUbah} />
            </div>
        </Card>
    )
}

export default PeranIzinPage
