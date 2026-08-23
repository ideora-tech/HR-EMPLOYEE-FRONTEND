import { Suspense } from 'react'
// Import langsung (bukan barrel @/components/ui) — halaman ini server component,
// barrel akan menarik seluruh komponen ui ke graph server dan gagal di build
import Spinner from '@/components/ui/Spinner'
import PeranTabs from '@/components/peran/PeranTabs'

/**
 * Halaman pengaturan akses — tiga tab dalam satu halaman:
 * Peran · Izin Peran · Menu (tab aktif lewat query `?tab=`).
 * Suspense diperlukan karena PeranTabs memakai useSearchParams.
 */
const PeranPage = () => (
    <Suspense
        fallback={
            <div className="flex justify-center py-10">
                <Spinner size={36} />
            </div>
        }
    >
        <PeranTabs />
    </Suspense>
)

export default PeranPage
