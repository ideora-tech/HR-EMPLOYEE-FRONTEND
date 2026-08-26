---
version: 1
slug: "src-app-public-pages-profil-page-tsx"
primary_target: "src/app/(public-pages)/profil/page.tsx"
related_targets: []
---

# Surface: /profil (Sky Dance Academy company profile)

Mode: Persuade.

Audience & job: calon siswa dan orang tua calon siswa mencari kelas tari; mereka datang untuk memahami program yang ditawarkan Sky Dance Academy dan cara menghubungi studio.

Action/task: satu CTA — hubungi via WhatsApp/telepon. Tidak ada form yang submit ke backend di rilis ini.

Proof/content: logo resmi (`public/logo-sky.jpeg`), struktur program nyata dari modul Kursus (tingkat PEMULA/MENENGAH/MAHIR, durasi sesi) ditulis sebagai konten statis representatif — bukan fetch live. Kontak (WA/alamat/jam) placeholder eksplisit, belum data final.

Constraints: tidak ada foto/galeri asli — jangan pakai stok foto orang yang bisa dikira dokumentasi asli. Tidak mengubah redirect `/` yang ada. Tidak menambah endpoint publik baru di backend untuk rilis ini.

Chosen direction: **Peta Rasi Bintang** (star chart / constellation map) — dipilih user lewat decision page, mengalahkan roll "Songket Register". Seed key `e8229632`, kind `pick`. Palet: `#0b0a1f` (ink), `#1a1145` (deep), `#3d2f7a` (violet), `#f2d675` (gold/CTA), `#c9b8e8` (lavender text). Logo diperlakukan sebagai medali/segel melingkar (bukan ditempel langsung di atas latar gelap, karena background foto putih). Tiga tingkat ditampilkan sebagai satu baris "rasi" ukuran sama untuk dibandingkan sekilas. Font: display serif bermata tinggi (mis. Cormorant) untuk judul/nama program, sans humanis (mis. Plus Jakarta Sans) untuk body/label — dipilih lewat next/font/google, bukan default Inter aplikasi.

Memorable moment: hero full-bleed langit malam dengan logo sebagai bintang paling terang, garis rasi tipis emas menghubungkan ke 3 titik tingkat kelas; bintang latar berkedip pelan (twinkle, hormati prefers-reduced-motion).

Unresolved: nomor WA, alamat, jam operasional, dan daftar program final — placeholder eksplisit, wajib diisi user sebelum publish. Belum ada endpoint publik `/kursus/*` — koneksi live adalah pekerjaan tahap berikutnya.
