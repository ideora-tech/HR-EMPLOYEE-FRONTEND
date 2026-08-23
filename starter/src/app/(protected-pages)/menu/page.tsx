import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — kini tab "Menu" di halaman Peran. */
const MenuPage = () => {
    redirect(`${ROUTES.PERAN}?tab=menu`)
}

export default MenuPage
