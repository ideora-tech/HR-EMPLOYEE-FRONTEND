'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import ReminderService from '@/services/kursus/reminder.service'
import { ROUTES } from '@/constants/route.constant'
import { PiBellDuotone } from 'react-icons/pi'

/**
 * Lonceng notifikasi header — badge merah = jumlah reminder perpanjangan
 * siswa yang jatuh tempo. Klik → halaman Reminder Perpanjangan.
 */
const _HeaderNotificationBell = () => {
    const [count, setCount] = useState(0)
    const router = useRouter()

    useEffect(() => {
        let active = true

        const fetchCount = async () => {
            try {
                const items = await ReminderService.getReminders()
                if (active) setCount(items.length)
            } catch {
                /* silent — user tanpa akses reminder cukup tanpa badge */
            }
        }

        fetchCount()
        const timer = setInterval(fetchCount, 5 * 60 * 1000)
        return () => {
            active = false
            clearInterval(timer)
        }
    }, [])

    return (
        <div
            role="button"
            aria-label="Reminder perpanjangan"
            className="text-2xl cursor-pointer"
            onClick={() => router.push(ROUTES.KURSUS_REMINDERS)}
        >
            {count > 0 ? (
                <Badge content={count} maxCount={99}>
                    <PiBellDuotone />
                </Badge>
            ) : (
                <PiBellDuotone />
            )}
        </div>
    )
}

const HeaderNotificationBell = withHeaderItem(_HeaderNotificationBell)

export default HeaderNotificationBell
