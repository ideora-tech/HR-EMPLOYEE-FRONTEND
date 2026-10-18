import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/route.constant'

/** Halaman lama — izin kini diatur per peran lewat tombol "Atur Izin" di halaman Peran. */
const IzinPeranPage = () => {
    redirect(ROUTES.PERAN)
}

export default IzinPeranPage
