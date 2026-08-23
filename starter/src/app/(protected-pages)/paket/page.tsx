import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — kini tab "Paket" di halaman Modul. */
const PaketPage = () => {
    redirect(`${ROUTES.MODUL}?tab=paket`)
}

export default PaketPage
