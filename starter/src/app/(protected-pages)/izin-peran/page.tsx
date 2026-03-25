'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, Input, Select, Notification, Spinner, toast } from '@/components/ui'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import IzinPeranService from '@/services/izin-peran.service'
import PeranService from '@/services/peran.service'
import { parseApiError } from '@/utils/parseApiError'
import { AKSI_LIST } from '@/@types/izin-peran.types'
import type { IzinPeranMenuItem, AksiType } from '@/@types/izin-peran.types'
import type { IPeran } from '@/@types/peran.types'

type PermMap = Record<string, Set<AksiType>>
type PeranOption = { value: string; label: string }

const AKSI_LABEL: Record<AksiType, string> = {
    VIEW: 'Lihat',
    CREATE: 'Tambah',
    UPDATE: 'Edit',
    DELETE: 'Hapus',
}

const AKSI_COLOR: Record<AksiType, string> = {
    VIEW: 'text-sky-600',
    CREATE: 'text-emerald-600',
    UPDATE: 'text-amber-600',
    DELETE: 'text-red-500',
}

interface ColHeaderCheckboxProps {
    aksi: AksiType
    menus: IzinPeranMenuItem[]
    permMap: PermMap
    disabled: boolean
    onToggle: () => void
}

interface RowCheckboxProps {
    id_menu: string
    permMap: PermMap
    disabled: boolean
    onToggle: () => void
}

const RowCheckbox = ({
    id_menu,
    permMap,
    disabled,
    onToggle,
}: RowCheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const current = permMap[id_menu] ?? new Set<AksiType>()
    const allChecked = AKSI_LIST.every((a) => current.has(a))
    const someChecked = AKSI_LIST.some((a) => current.has(a))

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = someChecked && !allChecked
        }
    }, [allChecked, someChecked])

    return (
        <input
            ref={ref}
            type="checkbox"
            className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            checked={allChecked}
            disabled={disabled}
            onChange={onToggle}
        />
    )
}

interface RowAllHeaderCheckboxProps {
    menus: IzinPeranMenuItem[]
    permMap: PermMap
    disabled: boolean
    onToggle: () => void
}

const RowAllHeaderCheckbox = ({
    menus,
    permMap,
    disabled,
    onToggle,
}: RowAllHeaderCheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const allChecked =
        menus.length > 0 &&
        menus.every((m) => AKSI_LIST.every((a) => permMap[m.id_menu]?.has(a) ?? false))
    const someChecked = menus.some((m) =>
        AKSI_LIST.some((a) => permMap[m.id_menu]?.has(a) ?? false),
    )

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = someChecked && !allChecked
        }
    }, [allChecked, someChecked])

    return (
        <input
            ref={ref}
            type="checkbox"
            className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            checked={allChecked}
            disabled={disabled}
            onChange={onToggle}
        />
    )
}

const ColHeaderCheckbox = ({
    aksi,
    menus,
    permMap,
    disabled,
    onToggle,
}: ColHeaderCheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const allChecked =
        menus.length > 0 &&
        menus.every((m) => permMap[m.id_menu]?.has(aksi) ?? false)
    const someChecked = menus.some(
        (m) => permMap[m.id_menu]?.has(aksi) ?? false,
    )

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = someChecked && !allChecked
        }
    }, [allChecked, someChecked])

    return (
        <input
            ref={ref}
            type="checkbox"
            className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            checked={allChecked}
            disabled={disabled}
            onChange={onToggle}
        />
    )
}

const IzinPeranPage = () => {
    const [peranList, setPeranList] = useState<IPeran[]>([])
    const [selectedPeran, setSelectedPeran] = useState<string>('')
    const [menus, setMenus] = useState<IzinPeranMenuItem[]>([])
    const [permMap, setPermMap] = useState<PermMap>({})
    const [loadingPeran, setLoadingPeran] = useState(false)
    const [loadingMatrix, setLoadingMatrix] = useState(false)
    const [updatingMenu, setUpdatingMenu] = useState<string>('')
    const [selectingAll, setSelectingAll] = useState<AksiType | ''>('')
    const [selectingAllRow, setSelectingAllRow] = useState(false)
    const [searchMenu, setSearchMenu] = useState('')
    const [searchInput, setSearchInput] = useState('')

    // Load semua peran untuk selector
    useEffect(() => {
        const load = async () => {
            setLoadingPeran(true)
            try {
                const res = await PeranService.getAll({ limit: 100, aktif: 1 })
                if (res.success) setPeranList(res.data)
            } catch (err) {
                toast.push(
                    <Notification type="danger" title="Gagal memuat daftar peran">
                        {parseApiError(err)}
                    </Notification>,
                )
            } finally {
                setLoadingPeran(false)
            }
        }
        load()
    }, [])

    // Load matrix izin saat peran dipilih
    const loadMatrix = useCallback(async (kode_peran: string) => {
        if (!kode_peran) return
        setLoadingMatrix(true)
        try {
            const res = await IzinPeranService.getByPeran(kode_peran)
            if (res.success) {
                setMenus(res.data)
                const map: PermMap = {}
                for (const m of res.data) {
                    map[m.id_menu] = new Set(m.aksi as AksiType[])
                }
                setPermMap(map)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat izin peran">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoadingMatrix(false)
        }
    }, [])

    useEffect(() => {
        if (selectedPeran) loadMatrix(selectedPeran)
        else {
            setMenus([])
            setPermMap({})
        }
    }, [selectedPeran, loadMatrix])

    const handleToggleAll = async (aksi: AksiType) => {
        if (!selectedPeran || selectingAll || updatingMenu) return

        const allChecked =
            menus.length > 0 &&
            menus.every((m) => permMap[m.id_menu]?.has(aksi) ?? false)

        const prevPermMap = permMap
        const newPermMap: PermMap = {}
        for (const m of menus) {
            const current = permMap[m.id_menu] ?? new Set<AksiType>()
            const newSet = new Set(current)
            if (allChecked) newSet.delete(aksi)
            else newSet.add(aksi)
            newPermMap[m.id_menu] = newSet
        }

        const items = menus.map((m) => ({
            id_menu: m.id_menu,
            aksi: AKSI_LIST.filter((a) => newPermMap[m.id_menu]?.has(a)),
        }))

        setPermMap(newPermMap)
        setSelectingAll(aksi)
        try {
            await IzinPeranService.bulkSetAksi(selectedPeran, items)
        } catch (err) {
            setPermMap(prevPermMap)
            toast.push(
                <Notification type="danger" title="Gagal memperbarui izin">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSelectingAll('')
        }
    }

    const handleToggleRow = async (id_menu: string) => {
        if (!selectedPeran || updatingMenu || selectingAll || selectingAllRow) return

        const current = permMap[id_menu] ?? new Set<AksiType>()
        const allChecked = AKSI_LIST.every((a) => current.has(a))

        const newSet = new Set<AksiType>()
        if (!allChecked) AKSI_LIST.forEach((a) => newSet.add(a))

        const newAksi = AKSI_LIST.filter((a) => newSet.has(a))

        setPermMap((prev) => ({ ...prev, [id_menu]: newSet }))
        setUpdatingMenu(id_menu)
        try {
            await IzinPeranService.setAksi(selectedPeran, id_menu, newAksi)
        } catch (err) {
            setPermMap((prev) => ({ ...prev, [id_menu]: current }))
            toast.push(
                <Notification type="danger" title="Gagal memperbarui izin">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setUpdatingMenu('')
        }
    }

    const handleToggleAllRow = async () => {
        if (!selectedPeran || selectingAll || selectingAllRow || updatingMenu) return

        const allChecked =
            menus.length > 0 &&
            menus.every((m) => AKSI_LIST.every((a) => permMap[m.id_menu]?.has(a) ?? false))

        const prevPermMap = permMap
        const newPermMap: PermMap = {}
        for (const m of menus) {
            const newSet = new Set<AksiType>()
            if (!allChecked) AKSI_LIST.forEach((a) => newSet.add(a))
            newPermMap[m.id_menu] = newSet
        }

        const items = menus.map((m) => ({
            id_menu: m.id_menu,
            aksi: AKSI_LIST.filter((a) => newPermMap[m.id_menu]?.has(a)),
        }))

        setPermMap(newPermMap)
        setSelectingAllRow(true)
        try {
            await IzinPeranService.bulkSetAksi(selectedPeran, items)
        } catch (err) {
            setPermMap(prevPermMap)
            toast.push(
                <Notification type="danger" title="Gagal memperbarui izin">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSelectingAllRow(false)
        }
    }

    const handleToggle = async (id_menu: string, aksi: AksiType) => {
        if (!selectedPeran || updatingMenu) return

        const current = permMap[id_menu] ?? new Set<AksiType>()
        const newSet = new Set(current)
        if (newSet.has(aksi)) newSet.delete(aksi)
        else newSet.add(aksi)

        const newAksi = AKSI_LIST.filter((a) => newSet.has(a)) // jaga urutan tetap konsisten

        // Optimistic update
        setPermMap((prev) => ({ ...prev, [id_menu]: newSet }))
        setUpdatingMenu(id_menu)

        try {
            await IzinPeranService.setAksi(selectedPeran, id_menu, newAksi)
        } catch (err) {
            // Revert
            setPermMap((prev) => ({ ...prev, [id_menu]: current }))
            toast.push(
                <Notification type="danger" title="Gagal memperbarui izin">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setUpdatingMenu('')
        }
    }

    // Group menus by kode_modul, filter by search
    const grouped = useMemo(() => {
        const filtered = searchMenu
            ? menus.filter((m) =>
                m.nama_menu.toLowerCase().includes(searchMenu.toLowerCase()),
            )
            : menus

        const map: Record<string, IzinPeranMenuItem[]> = {}
        for (const m of filtered) {
            const key = m.kode_modul || 'GLOBAL'
            map[key] = [...(map[key] ?? []), m]
        }
        return map
    }, [menus, searchMenu])

    const peranOptions: PeranOption[] = peranList.map((p) => ({
        value: p.kode_peran,
        label: `${p.nama_peran} (${p.kode_peran})`,
    }))

    const selectedOption =
        peranOptions.find((o) => o.value === selectedPeran) ?? null

    // Hitung total izin yang aktif (untuk label info)
    const totalIzin = useMemo(
        () =>
            Object.values(permMap).reduce(
                (sum, set) => sum + set.size,
                0,
            ),
        [permMap],
    )

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Izin Peran</h4>,
                    extra: selectedPeran && !loadingMatrix ? (
                        <span className="text-sm text-gray-400">
                            {totalIzin} izin aktif
                        </span>
                    ) : undefined,
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* Selector row */}
                <div className="flex items-center gap-3 px-4 pb-3">
                    <div className="w-72 shrink-0">
                        <Select<PeranOption>
                            placeholder={
                                loadingPeran ? 'Memuat peran...' : 'Pilih peran...'
                            }
                            options={peranOptions}
                            value={selectedOption}
                            isDisabled={loadingPeran}
                            onChange={(opt) =>
                                setSelectedPeran(
                                    opt ? (opt as PeranOption).value : '',
                                )
                            }
                        />
                    </div>

                    {selectedPeran && (
                        <Input
                            className="flex-1"
                            placeholder="Cari nama menu..."
                            suffix={
                                searchInput ? (
                                    <HiOutlineX
                                        className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                        onClick={() => {
                                            setSearchInput('')
                                            setSearchMenu('')
                                        }}
                                    />
                                ) : (
                                    <HiOutlineSearch className="text-gray-400 text-lg" />
                                )
                            }
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value)
                                setSearchMenu(e.target.value)
                            }}
                        />
                    )}
                </div>

                {/* Content */}
                {!selectedPeran ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                        <p className="text-sm">
                            Pilih peran untuk melihat dan mengatur izin akses
                        </p>
                    </div>
                ) : loadingMatrix ? (
                    <div className="flex justify-center items-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : menus.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        Belum ada data menu
                    </div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        Tidak ada menu yang sesuai pencarian
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                                        Menu
                                    </th>
                                    <th className="text-center px-4 py-3 font-semibold w-24 text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-1">
                                            <RowAllHeaderCheckbox
                                                menus={menus}
                                                permMap={permMap}
                                                disabled={!!selectingAll || !!updatingMenu || selectingAllRow}
                                                onToggle={handleToggleAllRow}
                                            />
                                            <span>Semua</span>
                                        </div>
                                    </th>
                                    {AKSI_LIST.map((aksi) => (
                                        <th
                                            key={aksi}
                                            className={`text-center px-4 py-3 font-semibold w-28 ${AKSI_COLOR[aksi]}`}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <ColHeaderCheckbox
                                                    aksi={aksi}
                                                    menus={menus}
                                                    permMap={permMap}
                                                    disabled={!!selectingAll || !!updatingMenu}
                                                    onToggle={() => handleToggleAll(aksi)}
                                                />
                                                <span>{AKSI_LABEL[aksi]}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(grouped).map(
                                    ([kode_modul, menuList]) => (
                                        <>
                                            {/* Group header */}
                                            <tr
                                                key={`group-${kode_modul}`}
                                                className="bg-gray-50/60 dark:bg-gray-800/60"
                                            >
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest"
                                                >
                                                    {kode_modul}
                                                </td>
                                            </tr>

                                            {/* Menu rows */}
                                            {menuList.map((menu) => {
                                                const isUpdating =
                                                    updatingMenu === menu.id_menu
                                                return (
                                                    <tr
                                                        key={menu.id_menu}
                                                        className={`border-b border-gray-100 dark:border-gray-700 transition-opacity ${isUpdating
                                                            ? 'opacity-50'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-gray-700 dark:text-gray-200">
                                                                {menu.nama_menu}
                                                            </p>
                                                            {menu.path && (
                                                                <p className="text-xs text-gray-400 font-mono">
                                                                    {menu.path}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="text-center px-4 py-3">
                                                            <RowCheckbox
                                                                id_menu={menu.id_menu}
                                                                permMap={permMap}
                                                                disabled={
                                                                    isUpdating ||
                                                                    !!updatingMenu ||
                                                                    !!selectingAll ||
                                                                    selectingAllRow
                                                                }
                                                                onToggle={() => handleToggleRow(menu.id_menu)}
                                                            />
                                                        </td>
                                                        {AKSI_LIST.map((aksi) => {
                                                            const checked =
                                                                permMap[
                                                                    menu.id_menu
                                                                ]?.has(aksi) ??
                                                                false
                                                            return (
                                                                <td
                                                                    key={aksi}
                                                                    className="text-center px-4 py-3"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
                                                                        checked={
                                                                            checked
                                                                        }
                                                                        disabled={
                                                                            isUpdating ||
                                                                            !!updatingMenu ||
                                                                            !!selectingAll
                                                                        }
                                                                        onChange={() =>
                                                                            handleToggle(
                                                                                menu.id_menu,
                                                                                aksi,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                )
                                            })}
                                        </>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default IzinPeranPage
