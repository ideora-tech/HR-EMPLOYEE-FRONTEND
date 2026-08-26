import { displayFont } from './fonts'

export default function StatementBand() {
    return (
        <section className="relative bg-[var(--sky-navy)] px-6 py-16 text-center">
            <p
                className={`${displayFont.className} mx-auto max-w-xl text-2xl font-bold leading-snug text-white sm:text-3xl`}
            >
                &ldquo;Dari langkah pertama, menuju panggung.&rdquo;
            </p>
        </section>
    )
}
