import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — Akses Modul kini digantikan tab "Izin Paket" di halaman Modul. */
const AksesModulPage = () => {
    redirect(`${ROUTES.MODUL}?tab=izin-paket`)
}

export default AksesModulPage
