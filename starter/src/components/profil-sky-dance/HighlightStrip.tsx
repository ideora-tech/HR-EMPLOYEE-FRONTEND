import { HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineSparkles, HiOutlineUserGroup } from 'react-icons/hi'

const ITEM = [
    { icon: HiOutlineAcademicCap, label: '3 Tingkat Kelas' },
    { icon: HiOutlineCalendar, label: 'Jadwal Rutin Mingguan' },
    { icon: HiOutlineUserGroup, label: 'Instruktur Berpengalaman' },
    { icon: HiOutlineSparkles, label: 'Kuota Kelas Terbatas' },
]

export default function HighlightStrip() {
    return (
        <div className="relative bg-[var(--sky-surface)] px-6 py-8">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
                {ITEM.map(({ icon: Icon, label }) => (
                    <div
                        key={label}
                        className="flex flex-col items-center gap-2 text-center"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sky-primary)]/10">
                            <Icon className="text-2xl text-[var(--sky-primary)]" />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--sky-ink)]">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
