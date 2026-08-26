import Image from 'next/image'
import { HiOutlineClock, HiOutlineLocationMarker, HiOutlineMail } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { displayFont } from './fonts'
import { KONTAK, NAV_LINKS, waLink } from './data'

export default function Footer() {
    const tahun = new Date().getFullYear()

    return (
        <footer id="kontak" className="relative bg-[var(--sky-navy)] px-6 pb-8 pt-16">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white">
                            <Image
                                src="/logo-sky.jpeg"
                                alt="Logo Sky Dance Academy"
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                            />
                        </span>
                        <span className={`${displayFont.className} text-lg font-bold text-white`}>
                            Sky Dance Academy
                        </span>
                    </div>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                        Sekolah dance berjenjang — kelas terjadwal dari Pemula
                        hingga Mahir, dibimbing instruktur berpengalaman.
                    </p>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                        Halaman
                    </h3>
                    <ul className="mt-4 flex flex-col gap-2.5">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="text-sm text-white/60 hover:text-white"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                        Kontak
                    </h3>
                    <ul className="mt-4 flex flex-col gap-3 text-sm text-white/60">
                        <li className="flex items-start gap-2">
                            <HiOutlineLocationMarker className="mt-0.5 shrink-0 text-[var(--sky-primary)]" />
                            <span>{KONTAK.alamat}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FaWhatsapp className="mt-0.5 shrink-0 text-[var(--sky-primary)]" />
                            <a href={waLink('Halo Sky Dance Academy.')} className="hover:text-white">
                                {KONTAK.whatsappTampil}
                            </a>
                        </li>
                        <li className="flex items-start gap-2">
                            <HiOutlineMail className="mt-0.5 shrink-0 text-[var(--sky-primary)]" />
                            <span>{KONTAK.email}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <HiOutlineClock className="mt-0.5 shrink-0 text-[var(--sky-primary)]" />
                            <span>{KONTAK.jamOperasional}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
                <p>&copy; {tahun} Sky Dance Academy. Hak cipta dilindungi undang-undang.</p>
                <p>Dibuat oleh Maritime Digital Solution</p>
            </div>
        </footer>
    )
}
