'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui'

export interface QueryTabItem {
    /** Nilai di query `?tab=` — pakai slug route lama agar redirect-nya alami */
    value: string
    label: string
    content: ReactNode
}

interface QueryTabsProps {
    /** Judul kartu (mis. "Pengaturan Modul") — tampil di kiri atas, sejajar tombol aksi panel aktif */
    title?: ReactNode
    tabs: QueryTabItem[]
    /** Tab pertama bila `?tab=` kosong/tidak dikenal; tab ini tidak menulis query */
    defaultValue?: string
}

interface TabHeaderSlot {
    /** Elemen header kartu tempat panel memasang tombol aksinya (portal). null sebelum mount. */
    slot: HTMLElement | null
}

/**
 * Dipakai TabPanelCard: bila ada, panel berada di dalam QueryTabs dan tidak
 * perlu membuat kartu sendiri — tombol aksinya dipasang ke header kartu luar.
 */
export const TabHeaderSlotContext = createContext<TabHeaderSlot | null>(null)

export const useTabHeaderSlot = () => useContext(TabHeaderSlotContext)

/**
 * Tab yang tab aktifnya disimpan di query `?tab=` supaya bisa di-bookmark,
 * di-refresh, dan dibagikan. Tampilan mengikuti halaman Kursus › Kelas:
 * satu kartu berisi judul + tombol aksi, strip tab, lalu konten tab yang
 * rapat dengan tabel. Hanya konten tab aktif yang dirender, jadi tiap panel
 * hanya memuat datanya saat dibuka.
 *
 * Harus dibungkus <Suspense> oleh halaman pemanggil (useSearchParams).
 */
const QueryTabs = ({ title, tabs, defaultValue }: QueryTabsProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [slot, setSlot] = useState<HTMLElement | null>(null)

    const fallback = defaultValue ?? tabs[0]?.value ?? ''
    const rawTab = searchParams.get('tab')
    const activeTab =
        rawTab !== null && tabs.some((t) => t.value === rawTab) ? rawTab : fallback
    const active = tabs.find((t) => t.value === activeTab)

    const handleChange = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value === fallback) {
                params.delete('tab')
            } else {
                params.set('tab', value)
            }
            const query = params.toString()
            router.replace(query ? `${pathname}?${query}` : pathname)
        },
        [fallback, pathname, router, searchParams],
    )

    return (
        <Card bodyClass="p-0">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-0">
                <h4>{title}</h4>
                {/* Slot tombol aksi — diisi panel aktif lewat TabPanelCard */}
                <div ref={setSlot} className="flex items-center gap-2" />
            </div>
            <div className="px-4 pt-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex gap-0 overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => handleChange(t.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                                activeTab === t.value
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                            ].join(' ')}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="pt-3">
                <TabHeaderSlotContext.Provider value={{ slot }}>
                    {active ? <div key={active.value}>{active.content}</div> : null}
                </TabHeaderSlotContext.Provider>
            </div>
        </Card>
    )
}

export default QueryTabs
