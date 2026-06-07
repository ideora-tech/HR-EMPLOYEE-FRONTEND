import Link from 'next/link'

type KpiColor = 'purple' | 'green' | 'orange' | 'blue' | 'red' | 'teal'

interface KpiCardProps {
    icon: string
    label: string
    value: string | number
    sub?: string
    color: KpiColor
    href?: string
    loading?: boolean
}

const COLOR_MAP: Record<KpiColor, { bg: string; text: string; icon: string }> = {
    purple: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', icon: 'bg-violet-100 dark:bg-violet-500/20' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-100 dark:bg-emerald-500/20' },
    orange: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: 'bg-amber-100 dark:bg-amber-500/20' },
    blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: 'bg-blue-100 dark:bg-blue-500/20' },
    red:    { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: 'bg-red-100 dark:bg-red-500/20' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', icon: 'bg-teal-100 dark:bg-teal-500/20' },
}

const KpiCard = ({ icon, label, value, sub, color, href, loading }: KpiCardProps) => {
    const c = COLOR_MAP[color]
    const inner = (
        <div className={`rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${c.bg} hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center text-xl mb-3`}>
                {icon}
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            ) : (
                <p className={`text-3xl font-bold ${c.text} leading-tight mb-1`}>{value}</p>
            )}
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
        </div>
    )
    if (href) return <Link href={href}>{inner}</Link>
    return inner
}

export default KpiCard
