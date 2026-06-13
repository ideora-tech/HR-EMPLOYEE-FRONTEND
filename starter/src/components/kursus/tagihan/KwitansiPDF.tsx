import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { ITagihan, IPembayaran } from '@/@types/kursus.types'

/* ─── styles ─────────────────────────────────────────────── */

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
    divider: { borderBottom: '1pt dashed #bbb', marginVertical: 8 },
    table: { marginVertical: 8 },
    tableHead: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderTop: '1pt solid #ccc', borderBottom: '1pt solid #ccc', padding: '4 6' },
    tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #ddd', padding: '4 6' },
    colDesc: { flex: 1, fontSize: 10 },
    colAmt: { width: 80, textAlign: 'right', fontSize: 10 },
    colAmtBold: { width: 80, textAlign: 'right', fontSize: 10, fontFamily: 'Helvetica-Bold' },
    totalBox: { borderTop: '1pt solid #111', paddingTop: 6, marginTop: 4 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 },
    totalGrand: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, fontSize: 13, fontFamily: 'Helvetica-Bold' },
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

/* ─── component ──────────────────────────────────────────── */

interface KwitansiData extends ITagihan {
    siswa_detail?: { nama_siswa: string; telepon: string | null; alamat: string | null }
    pembayaran?: IPembayaran[]
}

interface Props {
    data: KwitansiData
    academyName?: string
    logoUrl?: string
}

export default function KwitansiPDF({ data, academyName = 'Sky Dance Academy', logoUrl }: Props) {
    const tanggal = fmtDate(data.dibuat_pada)
    const pembayaranDikonfirmasi = (data.pembayaran ?? []).filter((p) => p.status_konfirmasi === 1)
    const sisa = data.total_harga - data.total_bayar

    return (
        <Document title={`Kwitansi ${data.nomor_kwitansi ?? ''}`} author={academyName}>
            <Page size="A5" style={S.page}>
                {/* Header */}
                <View style={S.header}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    {logoUrl && <Image style={S.logo} src={logoUrl} />}
                    <Text style={S.headerTitle}>Kwitansi Pembayaran Kursus</Text>
                    <Text style={S.headerSub}>{academyName}</Text>
                </View>

                {/* No & Tanggal */}
                <View style={S.nomor}>
                    <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>No: </Text>{data.nomor_kwitansi ?? '-'}</Text>
                    <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Tanggal: </Text>{tanggal}</Text>
                </View>

                {/* Info Siswa */}
                <View style={S.section}>
                    <View style={S.row}>
                        <Text style={S.label}>Nama Siswa</Text>
                        <Text style={S.value}>: {data.siswa_detail?.nama_siswa ?? data.nama_siswa}</Text>
                    </View>
                    {data.siswa_detail?.telepon ? (
                        <View style={S.row}>
                            <Text style={S.label}>Telepon</Text>
                            <Text style={S.value}>: {data.siswa_detail.telepon}</Text>
                        </View>
                    ) : null}
                    {data.nama_tagihan ? (
                        <View style={S.row}>
                            <Text style={S.label}>Keterangan</Text>
                            <Text style={S.value}>: {data.nama_tagihan}</Text>
                        </View>
                    ) : null}
                    {data.periode_label ? (
                        <View style={S.row}>
                            <Text style={S.label}>Periode</Text>
                            <Text style={S.value}>: {data.periode_label}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Detail items */}
                {data.detail && data.detail.length > 0 ? (
                    <View style={S.table}>
                        <View style={S.tableHead}>
                            <Text style={[S.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Deskripsi</Text>
                            <Text style={[S.colAmt, { fontFamily: 'Helvetica-Bold' }]}>Harga</Text>
                        </View>
                        {data.detail.map((d, i) => (
                            <View key={i} style={S.tableRow}>
                                <Text style={S.colDesc}>
                                    {[d.nama_kelas, d.nama_paket, d.nama_kategori_umur]
                                        .filter(Boolean)
                                        .join(' — ')}
                                    {d.periode ? ` (${d.periode})` : ''}
                                </Text>
                                <Text style={S.colAmtBold}>{fmtRupiah(d.harga_akhir)}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Totals */}
                <View style={S.totalBox}>
                    {data.nominal_diskon != null && data.nominal_diskon > 0 ? (
                        <>
                            <View style={S.totalRow}>
                                <Text>Subtotal</Text>
                                <Text>{fmtRupiah(data.nominal_harga)}</Text>
                            </View>
                            <View style={S.totalRow}>
                                <Text>Diskon{data.nama_diskon ? ` (${data.nama_diskon})` : ''}</Text>
                                <Text>- {fmtRupiah(data.nominal_diskon)}</Text>
                            </View>
                        </>
                    ) : null}
                    <View style={S.totalGrand}>
                        <Text>Total Tagihan</Text>
                        <Text>{fmtRupiah(data.total_harga)}</Text>
                    </View>
                    <View style={S.totalRow}>
                        <Text>Total Dibayar</Text>
                        <Text>{fmtRupiah(data.total_bayar)}</Text>
                    </View>
                    {sisa > 0 ? (
                        <View style={S.totalRow}>
                            <Text>Sisa</Text>
                            <Text>{fmtRupiah(sisa)}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Riwayat pembayaran */}
                {pembayaranDikonfirmasi.length > 0 ? (
                    <View>
                        <Text style={S.historyTitle}>Riwayat Pembayaran:</Text>
                        {pembayaranDikonfirmasi.map((p) => (
                            <Text key={p.id_pembayaran} style={S.historyRow}>
                                {fmtDate(p.tanggal_bayar)} — {fmtRupiah(p.jumlah)} ({p.metode})
                            </Text>
                        ))}
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
