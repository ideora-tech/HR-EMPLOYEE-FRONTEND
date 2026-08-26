import { HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineStar } from 'react-icons/hi'
import { displayFont } from './fonts'
import { PROGRAM_TINGKAT } from './data'

const IKON: Record<string, typeof HiOutlineAcademicCap> = {
    PEMULA: HiOutlineAcademicCap,
    MENENGAH: HiOutlineChartBar,
    MAHIR: HiOutlineStar,
}

const WARNA: Record<string, string> = {
    PEMULA: 'var(--sky-primary)',
    MENENGAH: 'var(--sky-violet)',
    MAHIR: 'var(--sky-navy)',
}

export default function ProgramTingkat() {
    return (
        <section id="program" className="relative px-6 py-20">
            <div className="mx-auto max-w-5xl">
                <div className="text-center">
                    <h2
                        className={`${displayFont.className} text-3xl font-extrabold text-[var(--sky-ink)]`}
                    >
                        Program &amp; Tingkat
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm text-[var(--sky-body)]">
                        Program contoh berdasarkan struktur kelas kami — hubungi
                        kami untuk daftar lengkap &amp; jadwal terbaru.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {PROGRAM_TINGKAT.map((program) => {
                        const Icon = IKON[program.kode]
                        const warna = WARNA[program.kode]
                        return (
                            <div
                                key={program.kode}
                                className="flex flex-col items-center rounded-2xl border border-black/5 bg-[var(--sky-surface)] px-6 py-8 text-center shadow-sm"
                            >
                                <span
                                    className="flex h-12 w-12 items-center justify-center rounded-full"
                                    style={{ backgroundColor: `color-mix(in srgb, ${warna} 12%, white)` }}
                                >
                                    <Icon className="text-2xl" style={{ color: warna }} />
                                </span>
                                <h3
                                    className={`${displayFont.className} mt-4 text-2xl font-bold text-[var(--sky-ink)]`}
                                >
                                    {program.nama}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-[var(--sky-body)]">
                                    {program.deskripsi}
                                </p>
                                <p
                                    className="mt-4 text-xs font-bold uppercase tracking-[0.2em]"
                                    style={{ color: warna }}
                                >
                                    {program.durasi}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
