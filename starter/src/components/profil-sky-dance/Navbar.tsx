'use client'

import { useState } from 'react'
import Image from 'next/image'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import { displayFont } from './fonts'
import { NAV_LINKS } from './data'
import WhatsAppCta from './WhatsAppCta'

export default function Navbar() {
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-30 bg-[var(--sky-navy)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                <a href="#beranda" className="flex items-center gap-3">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                        <Image
                            src="/logo-sky.jpeg"
                            alt="Logo Sky Dance Academy"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                        />
                    </span>
                    <span className={`${displayFont.className} text-xl font-bold text-white`}>
                        Sky Dance Academy
                    </span>
                </a>

                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden md:block">
                    <WhatsAppCta
                        pesan="Halo Sky Dance Academy, saya ingin tahu info kelas dance."
                        className="!px-5 !py-2 text-xs"
                    />
                </div>

                <button
                    type="button"
                    aria-label={open ? 'Tutup menu' : 'Buka menu'}
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white md:hidden"
                >
                    {open ? (
                        <HiOutlineX className="text-2xl" />
                    ) : (
                        <HiOutlineMenu className="text-2xl" />
                    )}
                </button>
            </div>

            {open && (
                <nav className="flex flex-col gap-1 border-t border-white/10 px-6 py-4 md:hidden">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="rounded-lg px-2 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                        >
                            {link.label}
                        </a>
                    ))}
                    <WhatsAppCta
                        pesan="Halo Sky Dance Academy, saya ingin tahu info kelas dance."
                        className="mt-2 justify-center"
                    />
                </nav>
            )}
        </header>
    )
}
