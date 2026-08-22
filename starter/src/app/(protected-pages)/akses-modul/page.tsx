import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — kini tab "Akses Modul" di halaman Modul. */
const AksesModulPage = () => {
    redirect(`${ROUTES.MODUL}?tab=akses-modul`)
}

export default AksesModulPage
