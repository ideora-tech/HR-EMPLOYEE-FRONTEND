import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — kini tab "Menu" di halaman Modul. */
const MenuPage = () => {
    redirect(`${ROUTES.MODUL}?tab=menu`)
}

export default MenuPage
