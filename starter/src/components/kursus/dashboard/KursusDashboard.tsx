'use client'

import { useState } from 'react'
import TabRingkasan from './tabs/TabRingkasan'
import TabKeuangan from './tabs/TabKeuangan'
import TabSiswa from './tabs/TabSiswa'
import TabOperasional from './tabs/TabOperasional'

type TabId = 'ringkasan' | 'keuangan' | 'siswa' | 'operasional'

const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'ringkasan',   label: 'Ringkasan',   icon: '⊞' },
    { id: 'keuangan',    label: 'Keuangan',    icon: '₿' },
    { id: 'siswa',       label: 'Siswa',       icon: '👥' },
    { id: 'operasional', label: 'Operasional', icon: '📅' },
]

const KursusDashboard = () => {
    const [active, setActive] = useState<TabId>('ringkasan')

    return (
        <div className="flex flex-col gap-4">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-0 -mb-px">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActive(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                active === tab.id
                                    ? 'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {active === 'ringkasan' && <TabRingkasan />}
            {active === 'keuangan' && <TabKeuangan />}
            {active === 'siswa' && <TabSiswa />}
            {active === 'operasional' && <TabOperasional />}
        </div>
    )
}

export default KursusDashboard
