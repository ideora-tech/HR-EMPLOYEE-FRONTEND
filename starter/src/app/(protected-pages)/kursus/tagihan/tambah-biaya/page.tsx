import { Suspense } from 'react'
import TambahBiayaPage from '@/components/kursus/tagihan/TambahBiayaPage'

export default function Page() {
    return (
        <Suspense>
            <TambahBiayaPage />
        </Suspense>
    )
}
