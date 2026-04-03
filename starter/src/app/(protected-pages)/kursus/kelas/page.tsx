'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import { HiPlusCircle } from 'react-icons/hi'
import KelasTab from '@/components/kursus/kelas/KelasTab'
import PaketKursusTab from '@/components/kursus/paket/PaketKursusTab'
import KategoriUmurTab from '@/components/kursus/kategori-umur/KategoriUmurTab'
import { ROUTES } from '@/constants/route.constant'

type ActiveTab = 'kelas' | 'paket' | 'kategori-umur'

const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'paket', label: 'Paket' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'kategori-umur', label: 'Kategori Umur' },
]

const TAMBAH_LABEL: Record<ActiveTab, string> = {
    paket: 'Tambah Paket',
    kelas: 'Tambah Kelas',
    'kategori-umur': 'Tambah Kategori',
}

const KelasPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
        const tab = searchParams.get('tab') as ActiveTab | null
        return tab && ['kelas', 'paket', 'kategori-umur'].includes(tab) ? tab : 'paket'
    })
    const [pendingAdd, setPendingAdd] = useState(false)

    useEffect(() => {
        const tab = searchParams.get('tab') as ActiveTab | null
        if (tab && ['kelas', 'paket', 'kategori-umur'].includes(tab)) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const handleTambah = () => {
        if (activeTab === 'kategori-umur') {
            router.push(ROUTES.KURSUS_KATEGORI_UMUR_TAMBAH)
        } else {
            setPendingAdd(true)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <h4>Pengaturan Kelas</h4>
                    <Button
                        variant="solid"
                        size="sm"
                        customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                        icon={<HiPlusCircle />}
                        onClick={handleTambah}
                    >
                        {TAMBAH_LABEL[activeTab]}
                    </Button>
                </div>
                <div className="px-4 pt-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex gap-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={[
                                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-3">
                    {activeTab === 'kelas' && <KelasTab pendingAdd={pendingAdd} onPendingAddHandled={() => setPendingAdd(false)} />}
                    {activeTab === 'paket' && <PaketKursusTab pendingAdd={pendingAdd} onPendingAddHandled={() => setPendingAdd(false)} />}
                    {activeTab === 'kategori-umur' && <KategoriUmurTab />}
                </div>
            </Card>
        </div>
    )
}

export default KelasPage
