import { Suspense } from 'react'
// Import langsung (bukan barrel @/components/ui) — halaman ini server component,
// barrel akan menarik seluruh komponen ui ke graph server dan gagal di build
import Spinner from '@/components/ui/Spinner'
import ModulTabs from '@/components/modul/ModulTabs'

/**
 * Halaman pengaturan modul — tiga tab dalam satu halaman:
 * Modul · Akses Modul · Menu Modul (tab aktif lewat query `?tab=`).
 * Suspense diperlukan karena ModulTabs memakai useSearchParams.
 */
const ModulPage = () => (
    <Suspense
        fallback={
            <div className="flex justify-center py-10">
                <Spinner size={36} />
            </div>
        }
    >
        <ModulTabs />
    </Suspense>
)

export default ModulPage
