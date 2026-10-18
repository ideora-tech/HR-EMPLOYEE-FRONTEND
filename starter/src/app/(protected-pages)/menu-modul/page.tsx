import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — Menu Modul kini digantikan tab "Izin Paket" di halaman Modul. */
const MenuModulPage = () => {
    redirect(`${ROUTES.MODUL}?tab=izin-paket`)
}

export default MenuModulPage
