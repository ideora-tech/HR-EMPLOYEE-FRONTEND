'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Button,
    Card,
    Input,
    Select,
    Notification,
    Spinner,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiPlusCircle,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineSearch,
    HiOutlineX,
} from 'react-icons/hi'
import MenuTable from '@/components/menu/MenuTable'
import MenuCard from '@/components/menu/MenuCard'
import MenuService from '@/services/menu.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IMenu } from '@/@types/menu.types'

type ViewMode = 'table' | 'card'
type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const MenuPage = () => {
    const router = useRouter()
    const [menuList, setMenuList] = useState<IMenu[]>([])
    const [allMenus, setAllMenus] = useState<IMenu[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('table')

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<IMenu | null>(null)

    useEffect(() => {
        MenuService.getAll({ limit: 500 })
            .then((res) => { if (res.success) setAllMenus(res.data) })
            .catch(() => {/* ignore */ })
    }, [])

    const fetchMenu = useCallback(async () => {
        setLoading(true)
        try {
            const res = await MenuService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? Number(aktifFilter) : undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setMenuList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.FETCH(ENTITY.MENU)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, currentPage, pageSize])

    useEffect(() => {
        fetchMenu()
    }, [fetchMenu])

    const handleSearchSubmit = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }

    const handleFilterChange = (value: '' | '1' | '0') => {
        setAktifFilter(value)
        setCurrentPage(1)
    }

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleOpenEdit = useCallback(
        (m: IMenu) => router.push(`/menu/${m.id_menu}/edit`),
        [router],
    )

    const handleOpenDelete = useCallback((m: IMenu) => {
        setDeleteTarget(m)
    }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await MenuService.remove(deleteTarget.id_menu)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.MENU)}
                />,
            )
            setDeleteTarget(null)
            fetchMenu()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.DELETE(ENTITY.MENU)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Manajemen Menu</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={() => router.push('/menu/tambah')}
                        >
                            Tambah Menu
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* Filter row */}
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama atau kode menu... (tekan Enter)"
                        suffix={
                            searchInput ? (
                                <HiOutlineX
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={handleSearchClear}
                                />
                            ) : (
                                <HiOutlineSearch
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={handleSearchSubmit}
                                />
                            )
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit()
                        }}
                    />
                    <div className="w-44 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={
                                AKTIF_OPTIONS.find(
                                    (o) => o.value === aktifFilter,
                                ) ?? AKTIF_OPTIONS[0]
                            }
                            onChange={(opt) =>
                                handleFilterChange((opt as AktifOption).value)
                            }
                        />
                    </div>
                    <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                        <button
                            title="Tabel"
                            className={`p-2 text-lg transition-colors ${viewMode === 'table'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => setViewMode('table')}
                        >
                            <HiOutlineViewList />
                        </button>
                        <button
                            title="Kartu"
                            className={`p-2 text-lg transition-colors ${viewMode === 'card'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => setViewMode('card')}
                        >
                            <HiOutlineViewGrid />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'table' ? (
                    <MenuTable
                        data={menuList}
                        allMenus={allMenus}
                        loading={loading}
                        pagingData={{
                            total,
                            pageIndex: currentPage,
                            pageSize,
                        }}
                        onPaginationChange={handlePageChange}
                        onSelectChange={handlePageSizeChange}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                ) : loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : menuList.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        Belum ada data menu
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {menuList.map((menu) => (
                            <MenuCard
                                key={menu.id_menu}
                                menu={menu}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Menu?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setDeleteTarget(null)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            >
                <p className="text-sm">
                    Menu{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama}&rdquo;
                    </span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat
                    dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default MenuPage
