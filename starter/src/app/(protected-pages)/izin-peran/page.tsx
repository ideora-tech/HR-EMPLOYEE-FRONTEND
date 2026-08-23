import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — kini tab "Izin Peran" di halaman Peran. */
const IzinPeranPage = () => {
    redirect(`${ROUTES.PERAN}?tab=izin-peran`)
}

export default IzinPeranPage
