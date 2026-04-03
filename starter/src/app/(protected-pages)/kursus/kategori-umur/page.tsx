import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

export default function KategoriUmurRedirectPage() {
    redirect(ROUTES.KURSUS_KELAS)
}
