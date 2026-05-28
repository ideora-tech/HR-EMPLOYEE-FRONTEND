import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { IPembayaran } from '@/@types/kursus.types'

/* ─── styles (sama dengan KwitansiPDF) ──────────────────────── */

const S = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 11, padding: '1.5cm', color: '#111' },
    header: { alignItems: 'center', borderBottom: '2pt solid #111', paddingBottom: 10, marginBottom: 14 },
    logo: { width: 60, height: 60, objectFit: 'contain', marginBottom: 4 },
    headerTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
    headerSub: { fontSize: 9, color: '#666', marginTop: 2 },
    nomor: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, fontSize: 10 },
    section: { marginBottom: 10 },
    row: { flexDirection: 'row', marginBottom: 4 },
    label: { width: 120, color: '#555', fontSize: 10 },
    value: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
    table: { marginVertical: 8 },
    tableHead: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderTop: '1pt solid #ccc', borderBottom: '1pt solid #ccc', padding: '4 6' },
    tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #ddd', padding: '4 6' },
    colDesc: { flex: 1, fontSize: 10 },
    colAmtBold: { width: 80, textAlign: 'right', fontSize: 10, fontFamily: 'Helvetica-Bold' },
    totalBox: { borderTop: '1pt solid #111', paddingTop: 6, marginTop: 4 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 },
    totalGrand: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, fontSize: 13, fontFamily: 'Helvetica-Bold' },
    statusOk: { color: '#16a34a' },
    statusPending: { color: '#d97706' },
    statusTolak: { color: '#dc2626' },
    historyTitle: { fontSize: 9, color: '#555', fontFamily: 'Helvetica-Bold', marginBottom: 3, marginTop: 8 },
    historyRow: { fontSize: 9, color: '#555', marginBottom: 2 },
    footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 28 },
    ttd: { alignItems: 'center', width: 120 },
    ttdLine: { borderBottom: '1pt solid #111', width: '100%', marginTop: 50, marginBottom: 4 },
    ttdText: { fontSize: 10 },
})

/* ─── helpers ─────────────────────────────────────────────── */

const fmtRupiah = (n: number) =>
    'Rp ' + new Intl.NumberFormat('id-ID').format(n)

const fmtDate = (s: string | null | undefined) =>
    s
        ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-'

const STATUS_LABEL: Record<number, string> = {
    0: 'Menunggu Konfirmasi',
    1: 'Dikonfirmasi',
    2: 'Ditolak',
}

const METODE_LABEL: Record<string, string> = {
    TUNAI: 'Tunai',
    TRANSFER: 'Transfer Bank',
    QRIS: 'QRIS',
}

/* ─── component ──────────────────────────────────────────── */

interface Props {
    data: IPembayaran
    academyName?: string
    logoUrl?: string
}

export default function BuktiBayarPDF({ data, academyName = 'Sky Dance Academy', logoUrl }: Props) {
    const noBukti = `BP-${data.id_pembayaran.substring(0, 8).toUpperCase()}`
    const statusStyle =
        data.status_konfirmasi === 1
            ? S.statusOk
            : data.status_konfirmasi === 2
              ? S.statusTolak
              : S.statusPending

    return (
        <Document title={`Bukti Bayar - ${noBukti}`} author={academyName}>
            <Page size="A5" style={S.page}>
                {/* Header */}
                <View style={S.header}>
                    {logoUrl && <Image style={S.logo} src={logoUrl} />}
                    <Text style={S.headerTitle}>Bukti Pembayaran</Text>
                    <Text style={S.headerSub}>{academyName}</Text>
                </View>

                {/* No & Tanggal */}
                <View style={S.nomor}>
                    <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>No: </Text>{noBukti}</Text>
                    <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Tanggal: </Text>{fmtDate(data.tanggal_bayar)}</Text>
                </View>

                {/* Info Siswa */}
                <View style={S.section}>
                    <View style={S.row}>
                        <Text style={S.label}>Nama Siswa</Text>
                        <Text style={S.value}>: {data.nama_siswa ?? '—'}</Text>
                    </View>
                    {data.deskripsi ? (
                        <View style={S.row}>
                            <Text style={S.label}>Keterangan</Text>
                            <Text style={S.value}>: {data.deskripsi}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Tabel pembayaran */}
                <View style={S.table}>
                    <View style={S.tableHead}>
                        <Text style={[S.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Keterangan</Text>
                        <Text style={[S.colAmtBold, { textAlign: 'right' }]}>Jumlah</Text>
                    </View>
                    <View style={S.tableRow}>
                        <Text style={S.colDesc}>
                            Pembayaran {METODE_LABEL[data.metode] ?? data.metode}
                            {data.referensi ? ` (${data.referensi})` : ''}
                        </Text>
                        <Text style={S.colAmtBold}>{fmtRupiah(data.jumlah)}</Text>
                    </View>
                </View>

                {/* Total */}
                <View style={S.totalBox}>
                    <View style={S.totalGrand}>
                        <Text>Jumlah Dibayar</Text>
                        <Text>{fmtRupiah(data.jumlah)}</Text>
                    </View>
                    <View style={S.totalRow}>
                        <Text>Status</Text>
                        <Text style={statusStyle}>
                            {STATUS_LABEL[data.status_konfirmasi] ?? '-'}
                        </Text>
                    </View>
                    {data.dikonfirmasi_at && data.status_konfirmasi === 1 ? (
                        <View style={S.totalRow}>
                            <Text>Dikonfirmasi</Text>
                            <Text>{fmtDate(data.dikonfirmasi_at)}</Text>
                        </View>
                    ) : null}
                    {data.catatan_tolak ? (
                        <View style={S.totalRow}>
                            <Text>Catatan</Text>
                            <Text style={S.statusTolak}>{data.catatan_tolak}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Tagihan terkait */}
                {data.tagihan ? (
                    <View>
                        <Text style={S.historyTitle}>Info Tagihan:</Text>
                        <Text style={S.historyRow}>
                            Total Tagihan: {fmtRupiah(data.tagihan.total_harga)}
                        </Text>
                        <Text style={S.historyRow}>
                            Total Terbayar: {fmtRupiah(data.tagihan.total_bayar)}
                        </Text>
                        {data.tagihan.total_harga - data.tagihan.total_bayar > 0 ? (
                            <Text style={S.historyRow}>
                                Sisa: {fmtRupiah(data.tagihan.total_harga - data.tagihan.total_bayar)}
                            </Text>
                        ) : null}
                    </View>
                ) : null}

                {/* Footer TTD */}
                <View style={S.footer}>
                    <View style={S.ttd}>
                        <Text style={S.ttdText}>Hormat kami,</Text>
                        <View style={S.ttdLine} />
                        <Text style={S.ttdText}>{academyName}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
