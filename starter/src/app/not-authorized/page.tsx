'use client'

import Link from 'next/link'
import Container from '@/components/shared/Container'
import appConfig from '@/configs/app.config'

export default function NotAuthorized() {
    return (
        <div className="flex flex-auto flex-col h-[100vh]">
            <div className="h-full bg-white dark:bg-gray-800">
                <Container className="flex flex-col flex-auto items-center justify-center min-w-0 h-full">
                    <div className="min-w-[320px] md:min-w-[500px] max-w-[500px] text-center">
                        <div className="mb-6">
                            <h1 className="text-8xl font-bold text-gray-200 dark:text-gray-600">
                                404
                            </h1>
                        </div>
                        <h2 className="mb-4">Halaman Tidak Ditemukan</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-8">
                            Anda tidak memiliki akses ke halaman ini, atau halaman
                            tidak tersedia.
                        </p>
                        <Link
                            href={appConfig.authenticatedEntryPath}
                            className="button inline-flex items-center justify-center bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-700 ring-primary dark:ring-white hover:border-primary dark:hover:border-white hover:ring-1 hover:text-primary dark:hover:text-white dark:hover:bg-transparent text-gray-600 dark:text-gray-100 h-14 rounded-xl px-8 py-2 text-base button-press-feedback"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </Container>
            </div>
        </div>
    )
}
