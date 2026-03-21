'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Notification, Spinner, Tag, toast } from '@/components/ui'
import MenuService from '@/services/menu.service'
import ModulService from '@/services/modul.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IMenu } from '@/@types/menu.types'
import type { IModul } from '@/@types/modul.types'

// id_menu → Set<kode_modul> yang menu ini terdaftar di dalamnya
type MenuModulMap = Record<string, Set<string>>

// ─── Header checkbox dengan indeterminate support ──────────────────────────────
interface ColHeaderCheckboxProps {
    kode_modul: string
    menuList: IMenu[]
    menuModulMap: MenuModulMap
    disabled: boolean
    onToggleAll: (kode_modul: string) => void
}

const ColHeaderCheckbox = ({
    kode_modul,
    menuList,
    menuModulMap,
    disabled,
    onToggleAll,
}: ColHeaderCheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null)

    const activeCount = menuList.filter((m) =>
        menuModulMap[m.id_menu]?.has(kode_modul),
    ).length
    const allActive = activeCount === menuList.length && menuList.length > 0
    const someActive = activeCount > 0 && activeCount < menuList.length

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
            onChange={() => onToggleAll(kode_modul)}
        />
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const MenuModulPage = () => {
    const [menuList, setMenuList] = useState<IMenu[]>([])
    const [modulList, setModulList] = useState<IModul[]>([])
    const [menuModulMap, setMenuModulMap] = useState<MenuModulMap>({})
    const [loading, setLoading] = useState(true)
    const [updatingKey, setUpdatingKey] = useState<string>('') // "id_menu:kode_modul"
    const [selectingAll, setSelectingAll] = useState<string>('') // kode_modul sedang bulk-toggle

    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const [menuRes, modulRes] = await Promise.all([
                MenuService.getAll({ limit: 1000 }),
                ModulService.getAll({ aktif: 1, limit: 100 }),
            ])

            const menus = menuRes.success ? menuRes.data : []
            const moduls = modulRes.success ? modulRes.data : []

            setMenuList(menus)
            setModulList(moduls)

            const perModulResults = await Promise.all(
                moduls.map((m) => MenuService.getByModul(m.kode_modul)),
            )

            const map: MenuModulMap = {}
            menus.forEach((m) => {
                map[m.id_menu] = new Set()
            })
            perModulResults.forEach((res, idx) => {
                if (res.success) {
                    res.data.forEach((menu) => {
                        map[menu.id_menu]?.add(moduls[idx].kode_modul)
                    })
                }
            })

            setMenuModulMap(map)
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

    // ─── Toggle satu cell ────────────────────────────────────────────────────────
    const handleToggle = async (id_menu: string, kode_modul: string) => {
        const isChecked = menuModulMap[id_menu]?.has(kode_modul) ?? false
        const key = `${id_menu}:${kode_modul}`

        setMenuModulMap((prev) => {
            const newSet = new Set(prev[id_menu] ?? [])
            if (isChecked) newSet.delete(kode_modul)
            else newSet.add(kode_modul)
            return { ...prev, [id_menu]: newSet }
        })
        setUpdatingKey(key)

        try {
            if (isChecked) {
                await MenuService.unassignFromModul(kode_modul, id_menu)
            } else {
                await MenuService.assignToModul(kode_modul, id_menu)
            }
        } catch (err) {
            setMenuModulMap((prev) => {
                const newSet = new Set(prev[id_menu] ?? [])
                if (isChecked) newSet.add(kode_modul)
                else newSet.delete(kode_modul)
                return { ...prev, [id_menu]: newSet }
            })
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.MENU)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setUpdatingKey('')
        }
    }

    // ─── Toggle semua menu untuk satu modul ────────────────────────────────────
    const handleToggleAll = async (kode_modul: string) => {
        const allActive = menuList.every((m) =>
            menuModulMap[m.id_menu]?.has(kode_modul),
        )

        const snapshot = menuModulMap

        // Optimistic update semua menu
        setMenuModulMap((prev) => {
            const next = { ...prev }
            menuList.forEach((m) => {
                const newSet = new Set(prev[m.id_menu] ?? [])
                if (allActive) newSet.delete(kode_modul)
                else newSet.add(kode_modul)
                next[m.id_menu] = newSet
            })
            return next
        })
        setSelectingAll(kode_modul)

        try {
            await Promise.all(
                menuList.map((m) =>
                    allActive
                        ? MenuService.unassignFromModul(kode_modul, m.id_menu)
                        : MenuService.assignToModul(kode_modul, m.id_menu),
                ),
            )
        } catch (err) {
            setMenuModulMap(snapshot)
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.UPDATE(ENTITY.MENU)}
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
                    content: <h4>Konfigurasi Menu per Modul</h4>,
                    extra: (
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            Centang = menu tampil di modul tersebut
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
                                    <th className="px-4 py-3 text-left min-w-[240px] sticky left-0 bg-white dark:bg-gray-900 z-10">
                                        <span className="font-bold text-base text-gray-700 dark:text-gray-200">
                                            Menu
                                        </span>
                                    </th>
                                    {modulList.map((m) => (
                                        <th
                                            key={m.kode_modul}
                                            className="px-6 py-3 text-center text-gray-500 font-medium min-w-[130px]"
                                        >
                                            <div className="font-semibold text-gray-700 dark:text-gray-200">
                                                {m.nama}
                                            </div>
                                            <div className="text-xs font-normal text-gray-400 mt-0.5 mb-2">
                                                {m.kode_modul}
                                            </div>
                                            <ColHeaderCheckbox
                                                kode_modul={m.kode_modul}
                                                menuList={menuList}
                                                menuModulMap={menuModulMap}
                                                disabled={
                                                    selectingAll === m.kode_modul
                                                }
                                                onToggleAll={handleToggleAll}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {menuList.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={modulList.length + 1}
                                            className="text-center py-16 text-gray-400"
                                        >
                                            Belum ada data menu
                                        </td>
                                    </tr>
                                ) : (
                                    menuList.map((menu) => (
                                        <tr
                                            key={menu.id_menu}
                                            className="border-b border-gray-50 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            {/* Nama menu — sticky */}
                                            <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors z-10">
                                                <div className="font-bold text-base text-gray-700 dark:text-gray-200 mb-1">
                                                    {menu.nama}
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {menu.path && (
                                                        <span className="font-mono text-xs text-gray-400">
                                                            {menu.path}
                                                        </span>
                                                    )}
                                                    <Tag
                                                        className={
                                                            menu.aktif === 1
                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 text-xs'
                                                                : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100 text-xs'
                                                        }
                                                    >
                                                        {menu.aktif === 1
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </Tag>
                                                </div>
                                                {(menuModulMap[menu.id_menu]
                                                    ?.size ?? 0) === 0 && (
                                                    <span className="text-xs text-gray-400 italic">
                                                        selalu tampil
                                                    </span>
                                                )}
                                            </td>

                                            {/* Checkbox per modul */}
                                            {modulList.map((modul) => {
                                                const cellKey = `${menu.id_menu}:${modul.kode_modul}`
                                                const isChecked =
                                                    menuModulMap[
                                                        menu.id_menu
                                                    ]?.has(modul.kode_modul) ??
                                                    false
                                                return (
                                                    <td
                                                        key={modul.kode_modul}
                                                        className="px-6 py-3 text-center"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-wait"
                                                            checked={isChecked}
                                                            disabled={
                                                                updatingKey ===
                                                                    cellKey ||
                                                                selectingAll ===
                                                                    modul.kode_modul
                                                            }
                                                            onChange={() =>
                                                                handleToggle(
                                                                    menu.id_menu,
                                                                    modul.kode_modul,
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

export default MenuModulPage
