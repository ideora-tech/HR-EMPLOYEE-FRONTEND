import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

export default function TagihanPage() {
    redirect(ROUTES.KURSUS_PEMBAYARAN)
}
