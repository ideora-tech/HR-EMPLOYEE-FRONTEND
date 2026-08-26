# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: calon siswa dan orang tua calon siswa yang mencari kelas tari, mendarat di halaman company profile publik Sky Dance Academy untuk mengenal studio dan program yang ditawarkan. Job mereka: memahami apa yang ditawarkan, lalu menghubungi studio via WhatsApp/telepon. Secondary: siswa/orang tua siswa aktif yang ingin cek ulang info program.

## Product Purpose

Halaman company profile publik untuk **Sky Dance Academy**, sekolah tari yang dikelola lewat modul Kursus dari platform HR/Payroll SaaS multi-tenant ini (tenant "SKY Dance", akun owner `skyadmin`, paket KURSUS). Tujuan: memperkenalkan studio ke calon siswa baru dan mengarahkan mereka menghubungi studio. Sukses = pengunjung paham program yang ditawarkan dan mengklik CTA hubungi (WhatsApp/telepon).

## Positioning

Sky Dance Academy sudah punya identitas visual yang mengikat: logo watercolor kosmik nebula ungu-ke-pink dengan siluet penari melompat dan wordmark "SKY" + "DANCE ACADEMY". Ini bukan studio tari generik — arah visualnya ekspresif, artistik, dan sudah ditentukan oleh logo, bukan pilihan bebas.

## Operating Context

Halaman ini hidup di dalam monorepo HR/Payroll SaaS yang sama (Next.js 15 App Router, `HR-EMPLOYEE-FRONTEND/starter`, route group `(public-pages)`), bukan proyek terpisah. Data program tari (program_pengajaran, jadwal_kelas, tarif) sudah punya struktur nyata di backend NestJS/MySQL lewat modul Kursus (`/kursus/*`, lihat `HR-EMPLOYEE/.claude/kursus.md`), tapi semua endpoint itu saat ini wajib JWT Bearer — belum ada endpoint publik tanpa auth. Untuk versi ini, konten program ditulis statis (bukan fetch live); koneksi live ke database adalah rencana tahap berikutnya, bukan sekarang.

## Capabilities and Constraints

- CTA pengunjung: hubungi via WhatsApp/telepon saja. Tidak ada form yang submit ke backend di versi ini — jadi tidak perlu endpoint publik baru untuk rilis ini.
- Kontak (nomor WA, alamat studio, jam operasional): belum tersedia saat sesi ini (MySQL lokal tidak menyala, user belum kasih data final) — ditulis sebagai placeholder yang jelas ditandai TODO, wajib diisi user sebelum publish.
- Daftar program/kelas tari: user menyatakan data program nyata sudah ada di database, tapi tidak bisa ditarik langsung sesi ini. Ditulis sebagai konten statis representatif berdasarkan struktur data nyata modul Kursus (nama program, tingkat PEMULA/MENENGAH/MAHIR, dst), distrukturkan (mis. array/objek terpisah dari markup) supaya gampang diganti ke fetch API publik nanti tanpa desain ulang.
- Belum ada foto/galeri asli murid atau studio di project. Jangan pakai foto stok yang berpotensi dikira dokumentasi asli — treatment visual pakai motif dari logo (siluet penari, watercolor nebula, tipografi) dan/atau ilustrasi/gradient abstrak, bukan foto orang yang difabrikasi.
- URL: halaman baru di path terpisah (mis. `/profil`), tidak mengubah redirect `/` yang sudah ada ke `authenticatedEntryPath`.

## Brand Commitments

Logo resmi: `public/logo-sky.jpeg` — lingkaran watercolor nebula ungu-ke-pink dengan siluet penari melompat, wordmark "SKY" bold putih dengan drop-shadow biru, teks "DANCE ACADEMY" kapital navy di bawahnya, plus aksen bintang emas kecil. Nama produk mengikat: "Sky Dance Academy" / "SKY Dance".

**Arah visual /profil — standar kategori (dikonfirmasi user, menggantikan arah "Peta Rasi Bintang"):** setelah versi pertama (dunia langit-malam/rasi-bintang, arah "Peta Rasi Bintang") dinilai user "kurang suka", user memilih arah "standar kategori" — template dance-studio konvensional yang berani & mudah dikenali, bukan motif abstrak. Warna tetap bersumber dari logo (ungu `#4a3b7a`, pink/magenta `#b0529c` sebagai aksen utama, navy `#16204a`), latar didominasi putih/terang, tipografi Baloo 2 (bold, rounded) untuk judul + Plus Jakarta Sans untuk tubuh. User tidak punya referensi produk pembanding spesifik — didelegasikan ke standar profesional umum. Struktur informasi halaman tetap mengikuti referensi sibling site `sulita.ideora-tech.com` (lihat Operating Context).

## Evidence on Hand

- `public/logo-sky.jpeg` — logo resmi, evidence visual utama dan sumber arah warna/mood.
- `HR-EMPLOYEE/.claude/kursus.md` — mendokumentasikan struktur data program tari nyata modul Kursus (program_pengajaran, tarif per sesi/paket, jadwal kelas, tingkat). Dipakai sebagai referensi bentuk & istilah konten, bukan data live per sesi ini.
- Belum ada: foto studio/murid asli, testimoni, alamat/nomor WA/jam operasional final, harga final per program. Jangan difabrikasi — tandai eksplisit sebagai placeholder yang harus diisi sebelum publish.

## Product Principles

1. Jujur soal status data — placeholder vs nyata harus jelas dibedakan, tidak menyamar sebagai data live atau testimoni asli.
2. Satu ajakan bertindak yang jelas: hubungi via WhatsApp/telepon, tanpa friksi form di versi ini.
3. Warna & tipografi bersumber dari logo yang sudah ada, meski kerangka halaman dan gaya visual boleh mengikuti pola template dance-studio konvensional (keputusan user) — bukan pilihan bebas AI.
4. Dibangun agar gampang "naik kelas" ke data live dari `/kursus/*` begitu endpoint publik tersedia, tanpa desain ulang.
