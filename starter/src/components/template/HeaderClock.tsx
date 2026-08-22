'use client'

import { useState, useEffect } from 'react'

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const pad = (n: number) => String(n).padStart(2, '0')

const HeaderClock = () => {
    // Mulai null agar render server & client pertama identik (hindari hydration error)
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setNow(new Date())
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (!now) {
        return <div className="hidden sm:block w-44" aria-hidden="true" />
    }

    return (
        <div className="hidden sm:flex flex-col justify-center leading-tight ml-1">
            <span className="font-bold text-base text-gray-900 dark:text-gray-100 tabular-nums">
                {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
                {HARI[now.getDay()]}, {now.getDate()} {BULAN[now.getMonth()]} {now.getFullYear()}
            </span>
        </div>
    )
}

export default HeaderClock
