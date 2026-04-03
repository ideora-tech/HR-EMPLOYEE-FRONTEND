import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

export default function PaketKursusRedirectPage() {
    redirect(ROUTES.KURSUS_KELAS)
}
