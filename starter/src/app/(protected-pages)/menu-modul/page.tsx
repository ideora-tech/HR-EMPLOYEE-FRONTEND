import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — kini tab "Menu Modul" di halaman Modul. */
const MenuModulPage = () => {
    redirect(`${ROUTES.MODUL}?tab=menu-modul`)
}

export default MenuModulPage
