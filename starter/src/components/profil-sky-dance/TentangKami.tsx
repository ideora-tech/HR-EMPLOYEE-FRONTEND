import { displayFont } from './fonts'

export default function TentangKami() {
    return (
        <section id="tentang" className="relative mx-auto max-w-2xl px-6 pb-16 pt-12 text-center">
            <h2
                className={`${displayFont.className} text-3xl font-extrabold text-[var(--sky-ink)]`}
            >
                Tentang Kami
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--sky-body)]">
                Sky Dance Academy adalah sekolah dance berjenjang: setiap murid
                berjalan dari dasar gerak hingga siap tampil di panggung,
                lewat kelas terjadwal dan bimbingan instruktur yang menekuni
                dunia dance.
            </p>
        </section>
    )
}
