'use client'

import { createPortal } from 'react-dom'
import { Card } from '@/components/ui'
import type { CardProps } from '@/components/ui/Card'
import { useTabHeaderSlot } from '@/components/shared/QueryTabs'

/**
 * Pengganti <Card> untuk panel yang bisa tampil sebagai tab.
 *
 * - Di dalam QueryTabs: kartu tidak dibuat (kartu sudah disediakan QueryTabs);
 *   `header.extra` (tombol Tambah dsb.) dipasang ke header kartu luar lewat
 *   portal, `header.content` (judul) disembunyikan karena label tab sudah
 *   mewakilinya, dan isi panel dirender rapat di bawah strip tab.
 * - Di luar QueryTabs (dipakai mandiri): berperilaku persis seperti <Card>.
 */
const TabPanelCard = ({ header, bodyClass, children, ...rest }: CardProps) => {
    const ctx = useTabHeaderSlot()

    if (!ctx) {
        return (
            <Card header={header} bodyClass={bodyClass} {...rest}>
                {children}
            </Card>
        )
    }

    return (
        <>
            {ctx.slot && header?.extra ? createPortal(header.extra, ctx.slot) : null}
            <div className={bodyClass}>{children}</div>
        </>
    )
}

export default TabPanelCard
