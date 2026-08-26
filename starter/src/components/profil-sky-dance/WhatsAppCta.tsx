import { FaWhatsapp } from 'react-icons/fa'
import { waLink } from './data'

export default function WhatsAppCta({
    pesan,
    variant = 'solid',
    className = '',
}: {
    pesan: string
    variant?: 'solid' | 'outline' | 'light'
    className?: string
}) {
    const base =
        'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-transform hover:scale-[1.03]'
    const styles = {
        solid: 'bg-[var(--sky-primary)] text-white shadow-[0_10px_25px_-8px_rgba(176,82,156,0.6)] hover:bg-[var(--sky-primary-deep)]',
        outline: 'border-2 border-white text-white hover:bg-white/10',
        light: 'bg-white text-[var(--sky-primary-deep)] shadow-[0_10px_25px_-8px_rgba(0,0,0,0.35)] hover:bg-white/90',
    }

    return (
        <a
            href={waLink(pesan)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${base} ${styles[variant]} ${className}`}
        >
            <FaWhatsapp className="text-lg" />
            Hubungi via WhatsApp
        </a>
    )
}
