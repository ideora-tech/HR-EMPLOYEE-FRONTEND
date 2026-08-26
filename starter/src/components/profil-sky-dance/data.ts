/**
 * Konten halaman /profil (Sky Dance Academy).
 * Nilai bertanda "TODO" adalah placeholder eksplisit — wajib diganti data asli
 * sebelum publish. Daftar program ditulis statis berdasarkan struktur data
 * nyata modul Kursus (lihat HR-EMPLOYEE/.claude/kursus.md), bukan hasil fetch
 * live — endpoint publik /kursus/* belum tersedia.
 */

export const KONTAK = {
    whatsapp: '62800000000', // TODO: ganti nomor WhatsApp asli Sky Dance Academy
    whatsappTampil: '(segera diisi)', // TODO: ganti tampilan nomor WA asli
    alamat: 'Alamat studio (segera diisi)', // TODO: isi alamat studio asli
    jamOperasional: 'Senin — Sabtu (segera diisi)', // TODO: isi jam operasional asli
    email: 'email-menyusul@skydanceacademy.id', // TODO: ganti email asli
} as const

export const waLink = (pesan: string) =>
    `https://wa.me/${KONTAK.whatsapp}?text=${encodeURIComponent(pesan)}`

export const NAV_LINKS = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Tentang Kami', href: '#tentang' },
    { label: 'Program', href: '#program' },
    { label: 'Kontak', href: '#kontak' },
] as const

export type TingkatProgram = {
    kode: 'PEMULA' | 'MENENGAH' | 'MAHIR'
    nama: string
    deskripsi: string
    durasi: string
}

export const PROGRAM_TINGKAT: TingkatProgram[] = [
    {
        kode: 'PEMULA',
        nama: 'Kelas Pemula',
        deskripsi:
            'Dasar gerak, postur, dan ritme — titik awal setiap dancer sebelum melangkah lebih jauh.',
        durasi: '60 menit / sesi',
    },
    {
        kode: 'MENENGAH',
        nama: 'Kelas Menengah',
        deskripsi:
            'Teknik dan rangkaian koreografi yang lebih kompleks untuk dancer yang sudah punya dasar.',
        durasi: '60 menit / sesi',
    },
    {
        kode: 'MAHIR',
        nama: 'Kelas Mahir',
        deskripsi:
            'Persiapan performa dan panggung untuk dancer lanjut yang siap tampil.',
        durasi: '90 menit / sesi',
    },
]

export const SOROTAN = [
    'Kelas Pemula',
    'Kelas Menengah',
    'Kelas Mahir',
    'Jadwal Terjadwal',
] as const

export const NILAI_KAMI = [
    {
        icon: 'academic',
        judul: 'Kelas Berjenjang',
        deskripsi: 'Dari Pemula ke Mahir, setiap tingkat punya arah yang jelas.',
    },
    {
        icon: 'calendar',
        judul: 'Jadwal Terstruktur',
        deskripsi: 'Sesi kelas rutin terjadwal setiap minggu, bukan drop-in acak.',
    },
    {
        icon: 'users',
        judul: 'Instruktur Berpengalaman',
        deskripsi: 'Dibimbing pengajar yang menekuni dunia dance.',
    },
    {
        icon: 'group',
        judul: 'Kuota Kelas Terbatas',
        deskripsi: 'Tiap sesi dibatasi jumlah siswa supaya bimbingan tetap personal.',
    },
    {
        icon: 'clipboard',
        judul: 'Progres Tercatat Rapi',
        deskripsi: 'Kehadiran dan perkembangan tiap siswa tercatat per sesi.',
    },
    {
        icon: 'chat',
        judul: 'Komunikasi Mudah',
        deskripsi: 'Tanya jadwal, program, atau pendaftaran langsung via WhatsApp.',
    },
] as const
