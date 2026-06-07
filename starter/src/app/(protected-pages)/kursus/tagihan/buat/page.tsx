import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

export default function BuatTagihanPage() {
    redirect(ROUTES.KURSUS_PEMBAYARAN)
}
