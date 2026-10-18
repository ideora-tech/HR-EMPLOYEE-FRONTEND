'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Notification, Select, Spinner, toast } from '@/components/ui'
import PermissionMatrix from '@/components/shared/PermissionMatrix'
import IzinService from '@/services/izin.service'
import PaketService from '@/services/paket.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IItemIzin } from '@/@types/peran.types'
import type { IPaket } from '@/@types/paket.types'

type PaketOption = { value: string; label: string }

/**
 * Izin per paket langganan (SUPERADMIN). Menggantikan "Akses Modul" & "Menu Modul":
 * izin yang tidak dicentang di sini tidak bisa dipakai perusahaan berpaket ini, Owner sekalipun.
 */
const IzinPaketPanel = () => {
    const [paketList, setPaketList] = useState<IPaket[]>([])
    const [katalog, setKatalog] = useState<IItemIzin[]>([])
    const [kodePaket, setKodePaket] = useState('')
    const [tersimpan, setTersimpan] = useState<string[]>([])
    const [izin, setIzin] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingIzin, setLoadingIzin] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([PaketService.getAll({ limit: 100 }), IzinService.getKatalog()])
            .then(([resPaket, resKatalog]) => {
                setPaketList(resPaket.data)
                setKatalog(resKatalog.data)
                if (resPaket.data.length > 0) setKodePaket(resPaket.data[0].kode_paket)
            })
            .catch((err) => toast.push(<Notification type="danger" title={parseApiError(err)} />))
            .finally(() => setLoading(false))
    }, [])

    const muatIzin = useCallback(async (kode: string) => {
        setLoadingIzin(true)
        try {
            const res = await IzinService.getIzinPaket(kode)
            setTersimpan(res.data.kode_izin)
            setIzin(res.data.kode_izin)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoadingIzin(false)
        }
    }, [])

    useEffect(() => {
        if (kodePaket) muatIzin(kodePaket)
    }, [kodePaket, muatIzin])

    const paketOptions: PaketOption[] = useMemo(
        () =>
            paketList.map((p) => ({
                value: p.kode_paket,
                label: p.aktif === 1 ? p.nama_paket : `${p.nama_paket} (nonaktif)`,
            })),
        [paketList],
    )

    const berubah = useMemo(() => {
        if (izin.length !== tersimpan.length) return true
        const awal = new Set(tersimpan)
        return izin.some((k) => !awal.has(k))
    }, [izin, tersimpan])

    const simpan = async () => {
        setSaving(true)
        try {
            const res = await IzinService.setIzinPaket(kodePaket, izin)
            setTersimpan(res.data.kode_izin)
            setIzin(res.data.kode_izin)
            toast.push(<Notification type="success" title="Izin paket berhasil disimpan" />)
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

    return (
        <Card>
            <div className="flex flex-col gap-5">
                <div className="flex items-end justify-between gap-3 flex-wrap">
                    <div className="w-full sm:w-72">
                        <label className="text-sm font-semibold mb-1 block">Paket</label>
                        <Select<PaketOption>
                            options={paketOptions}
                            value={paketOptions.find((o) => o.value === kodePaket) ?? null}
                            isDisabled={saving}
                            onChange={(opt) => setKodePaket((opt as PaketOption).value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" disabled={!berubah || saving} onClick={() => setIzin(tersimpan)}>
                            Batalkan Perubahan
                        </Button>
                        <Button size="sm" variant="solid" loading={saving} disabled={!berubah || !kodePaket} onClick={simpan}>
                            Simpan
                        </Button>
                    </div>
                </div>

                <p className="text-sm text-gray-500">
                    Izin yang dicentang bisa dipakai perusahaan berpaket ini. Owner otomatis memegang semuanya;
                    peran lain hanya bisa diberi izin dari daftar ini. Izin yang dicabut langsung ditolak server;
                    tombol dan menu di layar pengguna menyesuaikan paling lambat 5 menit.
                </p>

                {loadingIzin ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : (
                    <PermissionMatrix catalog={katalog} value={izin} onChange={setIzin} disabled={saving} />
                )}
            </div>
        </Card>
    )
}

export default IzinPaketPanel
