'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Notification, Spinner, Tag, toast } from '@/components/ui'
import AksesModulService from '@/services/akses-modul.service'
import ModulService from '@/services/modul.service'
import PaketService from '@/services/paket.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IAksesModulTier } from '@/@types/akses-modul.types'
import type { IModul } from '@/@types/modul.types'
import type { IPaket } from '@/@types/paket.types'

type AksesMap = Record<string, Record<string, IAksesModulTier>>

// ─── Header checkbox with indeterminate support ────────────────────────────────
interface ColHeaderCheckboxProps {
    kode_paket: string
    modulList: IModul[]
    aksesMap: AksesMap
    disabled: boolean
    onToggleAll: (kode_paket: string) => void
}

const ColHeaderCheckbox = ({
    kode_paket,
    modulList,
    aksesMap,
    disabled,
    onToggleAll,
}: ColHeaderCheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null)

    const activeCount = modulList.filter(
        (m) => aksesMap[m.kode_modul]?.[kode_paket]?.aktif === 1,
    ).length
    const allActive = activeCount === modulList.length && modulList.length > 0
    const someActive = activeCount > 0 && activeCount < modulList.length

    useEffect(() => {
        if (ref.current) ref.current.indeterminate = someActive
    }, [someActive])

    return (
        <input
            ref={ref}
            type="checkbox"
            className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-wait"
            checked={allActive}
            disabled={disabled}
            onChange={() => onToggleAll(kode_paket)}
        />
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const AksesModulPage = () => {
    const [modulList, setModulList] = useState<IModul[]>([])
    const [paketList, setPaketList] = useState<IPaket[]>([])
    const [aksesMap, setAksesMap] = useState<AksesMap>({})
    const [loading, setLoading] = useState(true)
    const [togglingKey, setTogglingKey] = useState<string>('')
    const [selectingAll, setSelectingAll] = useState<string>('')

    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const [modulRes, paketRes, aksesRes] = await Promise.all([
                ModulService.getAll({ aktif: 1, limit: 100 }),
                PaketService.getAll({ aktif: 1, limit: 100 }),
                AksesModulService.getAll(),
            ])

            if (modulRes.success) setModulList(modulRes.data)
            if (paketRes.success) setPaketList(paketRes.data)

            if (aksesRes.success) {
                const map: AksesMap = {}
                aksesRes.data.forEach((item) => {
                    if (!map[item.kode_modul]) map[item.kode_modul] = {}
                    map[item.kode_modul][item.paket] = item
                })
                setAksesMap(map)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    const handleToggle = async (kode_modul: string, kode_paket: string) => {
        const current = aksesMap[kode_modul]?.[kode_paket]
        const key = `${kode_modul}:${kode_paket}`
        const newAktif = current?.aktif === 1 ? 0 : 1

        const placeholder: IAksesModulTier = current ?? {
            id_akses_modul: '',
            kode_modul,
            paket: kode_paket,
            aktif: 0,
            batasan: null,
            dibuat_pada: '',
            diubah_pada: null,
        }

        setAksesMap((prev) => ({
            ...prev,
            [kode_modul]: {
                ...prev[kode_modul],
                [kode_paket]: { ...placeholder, aktif: newAktif },
            },
        }))
        setTogglingKey(key)

        try {
            await AksesModulService.updateByPaketModul(kode_paket, kode_modul, {
                aktif: newAktif,
            })
        } catch (err) {
            setAksesMap((prev) => {
                if (current) {
                    return {
                        ...prev,
                        [kode_modul]: { ...prev[kode_modul], [kode_paket]: current },
                    }
                }
                const updated = { ...prev[kode_modul] }
                delete updated[kode_paket]
                return { ...prev, [kode_modul]: updated }
            })
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.AKSES_MODUL)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setTogglingKey('')
        }
    }

    const handleToggleAll = async (kode_paket: string) => {
        const allActive = modulList.every(
            (m) => aksesMap[m.kode_modul]?.[kode_paket]?.aktif === 1,
        )
        const newAktif = allActive ? 0 : 1

        const snapshot = aksesMap

        // Optimistic update semua modul
        setAksesMap((prev) => {
            const next = { ...prev }
            modulList.forEach((m) => {
                const existing = prev[m.kode_modul]?.[kode_paket]
                next[m.kode_modul] = {
                    ...next[m.kode_modul],
                    [kode_paket]: {
                        ...(existing ?? {
                            id_akses_modul: '',
                            kode_modul: m.kode_modul,
                            paket: kode_paket,
                            aktif: 0,
                            batasan: null,
                            dibuat_pada: '',
                            diubah_pada: null,
                        }),
                        aktif: newAktif,
                    },
                }
            })
            return next
        })
        setSelectingAll(kode_paket)

        try {
            await Promise.all(
                modulList.map((m) =>
                    AksesModulService.updateByPaketModul(
                        kode_paket,
                        m.kode_modul,
                        { aktif: newAktif },
                    ),
                ),
            )
        } catch (err) {
            setAksesMap(snapshot)
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.AKSES_MODUL)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSelectingAll('')
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Konfigurasi Akses Modul per Paket</h4>,
                    extra: (
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            Centang = modul tersedia di paket tersebut
                        </span>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left min-w-[220px] sticky left-0 bg-white dark:bg-gray-900 z-10">
                                        <span className="font-bold text-base text-gray-700 dark:text-gray-200">Modul</span>
                                    </th>
                                    {paketList.map((p) => (
                                        <th
                                            key={p.kode_paket}
                                            className="px-6 py-3 text-center text-gray-500 font-medium min-w-[130px]"
                                        >
                                            <div className="font-semibold text-gray-700 dark:text-gray-200">
                                                {p.nama_paket}
                                            </div>
                                            <div className="text-xs font-normal text-gray-400 mt-0.5 mb-2">
                                                {p.kode_paket}
                                            </div>
                                            <ColHeaderCheckbox
                                                kode_paket={p.kode_paket}
                                                modulList={modulList}
                                                aksesMap={aksesMap}
                                                disabled={selectingAll === p.kode_paket}
                                                onToggleAll={handleToggleAll}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modulList.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={paketList.length + 1}
                                            className="text-center py-16 text-gray-400"
                                        >
                                            Belum ada data modul aktif
                                        </td>
                                    </tr>
                                ) : (
                                    modulList.map((modul) => (
                                        <tr
                                            key={modul.id_modul}
                                            className="border-b border-gray-50 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors z-10">
                                                <div className="font-bold text-base text-gray-700 dark:text-gray-200 mb-1">
                                                    {modul.nama}
                                                </div>
                                                <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100 text-xs">
                                                    {modul.kode_modul}
                                                </Tag>
                                            </td>

                                            {paketList.map((p) => {
                                                const akses =
                                                    aksesMap[modul.kode_modul]?.[
                                                    p.kode_paket
                                                    ]
                                                const key = `${modul.kode_modul}:${p.kode_paket}`

                                                return (
                                                    <td
                                                        key={p.kode_paket}
                                                        className="px-6 py-3 text-center"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-wait"
                                                            checked={akses?.aktif === 1}
                                                            disabled={
                                                                togglingKey === key ||
                                                                selectingAll === p.kode_paket
                                                            }
                                                            onChange={() =>
                                                                handleToggle(
                                                                    modul.kode_modul,
                                                                    p.kode_paket,
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AksesModulPage
