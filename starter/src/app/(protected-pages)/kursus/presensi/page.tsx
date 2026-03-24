'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'
import PresensiKalender from '@/components/kursus/presensi/PresensiKalender'
import AbsenDrawer from '@/components/kursus/presensi/AbsenDrawer'
import type { IJadwalKelas } from '@/@types/kursus.types'

const PresensiPage = () => {
    const [kalenderRefresh, setKalenderRefresh] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedJadwal, setSelectedJadwal] = useState<IJadwalKelas | null>(null)
    const [selectedTanggal, setSelectedTanggal] = useState<string | null>(null)
    const [selectedPresensiId, setSelectedPresensiId] = useState<string | null>(null)

    const handleClickJadwal = (
        jadwal: IJadwalKelas,
        tanggal: string,
        presensiId: string | null,
    ) => {
        setSelectedJadwal(jadwal)
        setSelectedTanggal(tanggal)
        setSelectedPresensiId(presensiId)
        setDrawerOpen(true)
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Presensi Siswa</h4>,
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="px-4 pb-4">
                    <PresensiKalender
                        refreshToken={kalenderRefresh}
                        onClickJadwal={handleClickJadwal}
                    />
                </div>
            </Card>

            <AbsenDrawer
                open={drawerOpen}
                jadwal={selectedJadwal}
                tanggal={selectedTanggal}
                presensiId={selectedPresensiId}
                onClose={() => setDrawerOpen(false)}
                onSaved={() => setKalenderRefresh((n) => n + 1)}
            />
        </div>
    )
}

export default PresensiPage
