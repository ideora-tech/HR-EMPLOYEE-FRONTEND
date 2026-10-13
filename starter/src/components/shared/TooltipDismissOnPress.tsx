'use client'

import { useEffect } from 'react'

/**
 * Menutup tooltip begitu pemicunya ditekan.
 *
 * Tooltip template hanya menutup saat kursor keluar dari pemicunya. Bila klik pada
 * pemicu membuka Dialog, tooltip (z-50) masih tampil di atas overlay (z-40) selama
 * beberapa frame sampai browser mengirim mouseleave — terlihat sebagai kedip saat
 * modal muncul. Dipasang sekali di root layout agar berlaku untuk semua Tooltip
 * tanpa mengubah komponen template di components/ui.
 */
const TooltipDismissOnPress = () => {
    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            // Layar sentuh: tooltip justru dibuka lewat tap, jadi jangan ditutup.
            if (e.pointerType === 'touch') return
            if (!(e.target instanceof Element)) return
            // floating-ui menutup tooltip lewat listener mouseleave di elemen pemicu;
            // mouseleave tidak bubbling, jadi dikirim langsung ke elemen itu.
            e.target
                .closest('.tooltip-wrapper')
                ?.dispatchEvent(new MouseEvent('mouseleave'))
        }

        document.addEventListener('pointerdown', handlePointerDown, true)
        return () =>
            document.removeEventListener('pointerdown', handlePointerDown, true)
    }, [])

    return null
}

export default TooltipDismissOnPress
