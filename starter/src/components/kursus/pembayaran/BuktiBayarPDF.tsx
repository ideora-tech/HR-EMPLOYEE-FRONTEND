import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { IPembayaran } from '@/@types/kursus.types'

/* ─── styles ─────────────────────────────────────────────── */

const S = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 11, padding: '1.5cm', color: '#111' },
    header: { alignItems: 'center', borderBottom: '2pt solid #111', paddingBottom: 8, marginBottom: 14 },
    logo: { width: 56, height: 56, objectFit: 'contain', marginBottom: 4 },
    headerTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
    headerSub: { fontSize: 9, color: '#666', marginTop: 2 },
    nomor: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, fontSize: 10 },
    row: { flexDirection: 'row', marginBottom: 5 },
    label: { width: 130, color: '#555', fontSize: 10 },
    value: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
    divider: { borderBottom: '1pt dashed #bbb', marginVertical: 10 },
    amountBox: { backgroundColor: '#f5f5f5', borderLeft: '4pt solid #111', padding: '8 12', marginVertical: 12 },
    amountLabel: { fontSize: 9, color: '#666', marginBottom: 3 },
    amountValue: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
    statusOk: { color: '#16a34a' },
    statusPending: { color: '#d97706' },
    statusTolak: { color: '#dc2626' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28 },
    footerNote: { fontSize: 9, color: '#999', maxWidth: 160 },
    ttd: { alignItems: 'center', width: 110 },
    ttdLine: { borderBottom: '1pt solid #111', width: '100%', marginTop: 50, marginBottom: 4 },
    ttdText: { fontSize: 10 },
})

/* ─── helpers ─────────────────────────────────────────────── */

const fmtRupiah = (n: number) =>
    'Rp ' +
    new Intl.NumberFormat('id-ID').format(n)

const fmtDate = (s: string | null) =>
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

                {/* Siswa */}
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

                <View style={S.divider} />

                {/* Nominal */}
                <View style={S.amountBox}>
                    <Text style={S.amountLabel}>Jumlah Pembayaran</Text>
                    <Text style={S.amountValue}>{fmtRupiah(data.jumlah)}</Text>
                </View>

                {/* Detail transaksi */}
                <View style={S.row}>
                    <Text style={S.label}>Metode</Text>
                    <Text style={S.value}>: {METODE_LABEL[data.metode] ?? data.metode}</Text>
                </View>
                {data.referensi ? (
                    <View style={S.row}>
                        <Text style={S.label}>No. Referensi</Text>
                        <Text style={S.value}>: {data.referensi}</Text>
                    </View>
                ) : null}
                <View style={S.row}>
                    <Text style={S.label}>Status</Text>
                    <Text style={[S.value, statusStyle]}>
                        : {STATUS_LABEL[data.status_konfirmasi] ?? '-'}
                    </Text>
                </View>
                {data.dikonfirmasi_at && data.status_konfirmasi === 1 ? (
                    <View style={S.row}>
                        <Text style={S.label}>Dikonfirmasi</Text>
                        <Text style={S.value}>: {fmtDate(data.dikonfirmasi_at)}</Text>
                    </View>
                ) : null}
                {data.catatan_tolak ? (
                    <View style={S.row}>
                        <Text style={S.label}>Catatan</Text>
                        <Text style={[S.value, S.statusTolak]}>: {data.catatan_tolak}</Text>
                    </View>
                ) : null}

                <View style={S.divider} />

                {/* Footer */}
                <View style={S.footer}>
                    <Text style={S.footerNote}>
                        Dokumen ini merupakan bukti pembayaran resmi.{'\n'}
                        Simpan sebagai referensi transaksi Anda.
                    </Text>
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
