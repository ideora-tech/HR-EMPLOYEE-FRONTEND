'use client'

import { useCallback, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs } from '@/components/ui'

export interface QueryTabItem {
    /** Nilai di query `?tab=` — pakai slug route lama agar redirect-nya alami */
    value: string
    label: string
    content: ReactNode
}

interface QueryTabsProps {
    tabs: QueryTabItem[]
    /** Tab pertama bila `?tab=` kosong/tidak dikenal; tab ini tidak menulis query */
    defaultValue?: string
}

/**
 * Tab yang tab aktifnya disimpan di query `?tab=` supaya bisa di-bookmark,
 * di-refresh, dan dibagikan. Hanya konten tab aktif yang dirender
 * (Tabs.TabContent Ecme tidak me-mount tab lain), jadi tiap panel hanya
 * memuat datanya saat dibuka.
 *
 * Harus dibungkus <Suspense> oleh halaman pemanggil (useSearchParams).
 */
const QueryTabs = ({ tabs, defaultValue }: QueryTabsProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const fallback = defaultValue ?? tabs[0]?.value ?? ''
    const rawTab = searchParams.get('tab')
    const activeTab =
        rawTab !== null && tabs.some((t) => t.value === rawTab) ? rawTab : fallback

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
        <Tabs value={activeTab} onChange={handleChange}>
            <Tabs.TabList>
                {tabs.map((t) => (
                    <Tabs.TabNav key={t.value} value={t.value}>
                        {t.label}
                    </Tabs.TabNav>
                ))}
            </Tabs.TabList>
            <div className="mt-4">
                {tabs.map((t) => (
                    <Tabs.TabContent key={t.value} value={t.value}>
                        {t.content}
                    </Tabs.TabContent>
                ))}
            </div>
        </Tabs>
    )
}

export default QueryTabs
