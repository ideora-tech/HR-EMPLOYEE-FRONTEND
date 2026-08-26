import WhatsAppCta from './WhatsAppCta'
import { displayFont } from './fonts'
import { SOROTAN } from './data'

export default function Hero() {
    return (
        <section
            id="beranda"
            className="sky-hero-gradient relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-20"
        >
            <div className="relative mx-auto max-w-3xl">
                <h1
                    className={`${displayFont.className} text-4xl font-extrabold leading-tight text-white sm:text-5xl`}
                >
                    Kelas Dance Berjenjang, dari Langkah Pertama Menuju
                    Panggung
                </h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85">
                    Sky Dance Academy melatih dancer lewat kelas terjadwal
                    berjenjang — Pemula, Menengah, hingga Mahir — dibimbing
                    instruktur berpengalaman.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <WhatsAppCta pesan="Halo Sky Dance Academy, saya ingin tahu info kelas dance." />
                    <a
                        href="#program"
                        className="inline-flex items-center gap-2 rounded-full border-2 border-white px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-white/10"
                    >
                        Lihat Program
                    </a>
                </div>

                <ul className="mt-8 flex flex-wrap gap-2.5">
                    {SOROTAN.map((item) => (
                        <li
                            key={item}
                            className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
