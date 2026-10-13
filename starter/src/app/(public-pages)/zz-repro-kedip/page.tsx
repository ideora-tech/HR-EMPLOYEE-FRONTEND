'use client'

// SEMENTARA — halaman reproduksi kedip tooltip di atas overlay dialog. Hapus setelah selesai.
import { useState } from 'react'
import PembayaranSubRow from '@/components/kursus/pembayaran/PembayaranSubRow'
import PembayaranDetailModal from '@/components/kursus/pembayaran/PembayaranDetailModal'
import type { IPembayaran } from '@/@types/kursus.types'

const DUMMY = {
    id_pembayaran: 'd05c02f0-0000-4000-8000-000000000000',
    id_tagihan: 't1',
    nama_siswa: 'Siswa Uji',
    jumlah: 1650000,
    kembalian: 0,
    tanggal_bayar: '2026-08-26',
    metode: 'TRANSFER',
    status_konfirmasi: 1,
} as unknown as IPembayaran

export default function Page() {
    const [view, setView] = useState<IPembayaran | null>(null)
    return (
        <div className="p-10 pt-40">
            <table className="w-full text-sm">
                <tbody>
                    <PembayaranSubRow
                        pembayaran={DUMMY}
                        namaTagihan="Biaya Kelas"
                        cetakLoading={false}
                        onView={() => setView(DUMMY)}
                        onCetak={() => undefined}
                    />
                </tbody>
            </table>
            <PembayaranDetailModal
                pembayaran={view}
                cetakLoading={false}
                deleteLoading={false}
                onClose={() => setView(null)}
                onCetak={() => undefined}
                onDelete={() => undefined}
            />
        </div>
    )
}
