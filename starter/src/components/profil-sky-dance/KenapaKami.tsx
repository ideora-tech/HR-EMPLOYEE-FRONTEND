import {
    HiOutlineAcademicCap,
    HiOutlineCalendar,
    HiOutlineChatAlt2,
    HiOutlineClipboardCheck,
    HiOutlineUserGroup,
    HiOutlineUsers,
} from 'react-icons/hi'
import { displayFont } from './fonts'
import { NILAI_KAMI } from './data'

const IKON: Record<string, typeof HiOutlineAcademicCap> = {
    academic: HiOutlineAcademicCap,
    calendar: HiOutlineCalendar,
    users: HiOutlineUserGroup,
    group: HiOutlineUsers,
    clipboard: HiOutlineClipboardCheck,
    chat: HiOutlineChatAlt2,
}

export default function KenapaKami() {
    return (
        <section id="kenapa" className="relative bg-[var(--sky-surface)] px-6 py-20">
            <div className="mx-auto max-w-5xl">
                <h2
                    className={`${displayFont.className} text-center text-3xl font-extrabold text-[var(--sky-ink)]`}
                >
                    Kenapa Sky Dance
                </h2>

                <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {NILAI_KAMI.map((nilai) => {
                        const Icon = IKON[nilai.icon]
                        return (
                            <div key={nilai.judul} className="flex gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--sky-primary)]/10">
                                    <Icon className="text-xl text-[var(--sky-primary)]" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--sky-ink)]">
                                        {nilai.judul}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--sky-body)]">
                                        {nilai.deskripsi}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
