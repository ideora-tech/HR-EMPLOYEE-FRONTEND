'use client'

import { forwardRef } from 'react'
import { formatRupiah } from '@/utils/formatNumber'
import type { ITagihan, IPembayaran } from '@/@types/kursus.types'

interface KwitansiData extends ITagihan {
    siswa_detail?: {
        nama_siswa: string
        telepon: string | null
        alamat: string | null
    }
    pembayaran?: IPembayaran[]
}

interface KwitansiPrintProps {
    data: KwitansiData
    academyName?: string
}

const KwitansiPrint = forwardRef<HTMLDivElement, KwitansiPrintProps>(
    ({ data, academyName = 'Sky Dance Academy' }, ref) => {
        const tanggal = new Date(data.dibuat_pada).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
        })

        const pembayaranDikonfirmasi = (data.pembayaran ?? []).filter((p) => p.status_konfirmasi === 1)

        return (
            <div
                ref={ref}
                className="kwitansi-print-wrapper"
                style={{ display: 'none' }}
            >
                <style>{`
                    @media print {
                        body > *:not(.kwitansi-print-wrapper) { display: none !important; }
                        .kwitansi-print-wrapper { display: block !important; }
                        @page { size: A5; margin: 1.5cm; }
                    }
                    .kwitansi-print-wrapper {
                        font-family: 'Arial', sans-serif;
                        font-size: 12px;
                        color: #000;
                        width: 148mm;
                    }
                    .kw-header { display: flex; flex-direction: column; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
                    .kw-header img { height: 56px; width: auto; object-fit: contain; margin-bottom: 2px; }
                    .kw-header p { font-size: 11px; margin: 0; }
                    .kw-nomor { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; }
                    .kw-siswa { margin-bottom: 10px; }
                    .kw-row { display: flex; gap: 4px; margin-bottom: 2px; }
                    .kw-label { width: 120px; flex-shrink: 0; color: #555; }
                    table.kw-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                    table.kw-table th { background: #f0f0f0; font-size: 11px; padding: 4px 6px; border: 1px solid #ccc; text-align: left; }
                    table.kw-table td { font-size: 11px; padding: 4px 6px; border: 1px solid #ccc; }
                    .kw-total { border-top: 1px solid #000; padding-top: 6px; margin-top: 4px; }
                    .kw-total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .kw-total-row.grand { font-weight: bold; font-size: 13px; }
                    .kw-footer { display: flex; justify-content: flex-end; margin-top: 24px; }
                    .kw-ttd { text-align: center; width: 120px; }
                    .kw-ttd-line { border-bottom: 1px solid #000; margin-top: 50px; margin-bottom: 4px; }
                `}</style>

                <div className="kw-header">
                    <img src="/logo-sky.jpeg" alt={academyName} />
                    <p>Kwitansi Pembayaran Kursus</p>
                </div>

                <div className="kw-nomor">
                    <span><b>No:</b> {data.nomor_kwitansi ?? '-'}</span>
                    <span><b>Tanggal:</b> {tanggal}</span>
                </div>

                <div className="kw-siswa">
                    <div className="kw-row">
                        <span className="kw-label">Nama Siswa</span>
                        <span>: <b>{data.siswa_detail?.nama_siswa ?? data.nama_siswa}</b></span>
                    </div>
                    {data.siswa_detail?.telepon && (
                        <div className="kw-row">
                            <span className="kw-label">Telepon</span>
                            <span>: {data.siswa_detail.telepon}</span>
                        </div>
                    )}
                    {data.nama_tagihan && (
                        <div className="kw-row">
                            <span className="kw-label">Keterangan</span>
                            <span>: {data.nama_tagihan}</span>
                        </div>
                    )}
                    {data.periode_label && (
                        <div className="kw-row">
                            <span className="kw-label">Periode</span>
                            <span>: {data.periode_label}</span>
                        </div>
                    )}
                </div>

                {data.detail && data.detail.length > 0 && (
                    <table className="kw-table">
                        <thead>
                            <tr>
                                <th>Deskripsi</th>
                                <th style={{ textAlign: 'right', width: 80 }}>Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.detail.map((d, i) => (
                                <tr key={i}>
                                    <td>
                                        {d.nama_kelas && <>{d.nama_kelas} — </>}
                                        {d.nama_paket && <>{d.nama_paket} — </>}
                                        {d.nama_kategori_umur && <>{d.nama_kategori_umur}</>}
                                        {d.periode && <> ({d.periode})</>}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{formatRupiah(d.harga_akhir)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="kw-total">
                    {data.nominal_diskon != null && data.nominal_diskon > 0 && (
                        <>
                            <div className="kw-total-row">
                                <span>Subtotal</span>
                                <span>{formatRupiah(data.nominal_harga)}</span>
                            </div>
                            <div className="kw-total-row">
                                <span>Diskon{data.nama_diskon ? ` (${data.nama_diskon})` : ''}</span>
                                <span>- {formatRupiah(data.nominal_diskon)}</span>
                            </div>
                        </>
                    )}
                    <div className="kw-total-row grand">
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(data.total_harga)}</span>
                    </div>
                    <div className="kw-total-row">
                        <span>Total Dibayar</span>
                        <span>{formatRupiah(data.total_bayar)}</span>
                    </div>
                    {data.total_harga - data.total_bayar > 0 && (
                        <div className="kw-total-row">
                            <span>Sisa</span>
                            <span>{formatRupiah(data.total_harga - data.total_bayar)}</span>
                        </div>
                    )}
                </div>

                {pembayaranDikonfirmasi.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>
                        <b>Riwayat Pembayaran:</b>
                        {pembayaranDikonfirmasi.map((p) => (
                            <div key={p.id_pembayaran}>
                                {new Date(p.tanggal_bayar).toLocaleDateString('id-ID')} — {formatRupiah(p.jumlah)} ({p.metode})
                            </div>
                        ))}
                    </div>
                )}

                <div className="kw-footer">
                    <div className="kw-ttd">
                        <p style={{ fontSize: 11 }}>Hormat kami,</p>
                        <div className="kw-ttd-line" />
                        <p style={{ fontSize: 11 }}>{academyName}</p>
                    </div>
                </div>
            </div>
        )
    }
)

KwitansiPrint.displayName = 'KwitansiPrint'

export default KwitansiPrint
