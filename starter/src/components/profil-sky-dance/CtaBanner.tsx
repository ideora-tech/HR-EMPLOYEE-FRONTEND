import { displayFont } from './fonts'
import WhatsAppCta from './WhatsAppCta'

export default function CtaBanner() {
    return (
        <section className="sky-cta-banner-gradient relative overflow-hidden px-6 py-20 text-center">
            <h2
                className={`${displayFont.className} mx-auto max-w-lg text-3xl font-extrabold text-white sm:text-4xl`}
            >
                Siap Mulai Dance Bersama Kami?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/85">
                Ceritakan level dan jadwal yang kamu cari — tim kami bantu
                carikan kelas yang pas.
            </p>
            <div className="mt-8 flex justify-center">
                <WhatsAppCta
                    pesan="Halo Sky Dance Academy, saya ingin mendaftar kelas dance."
                    variant="light"
                />
            </div>
        </section>
    )
}
