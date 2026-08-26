import type { Metadata } from 'next'
import ProfilSkyDance from '@/components/profil-sky-dance/ProfilSkyDance'

export const metadata: Metadata = {
    title: 'Sky Dance Academy — Kelas Dance Berjenjang',
    description:
        'Sky Dance Academy: sekolah dance berjenjang dari Pemula hingga Mahir. Kelas terjadwal, instruktur berpengalaman. Hubungi kami via WhatsApp.',
}

export default function Page() {
    return <ProfilSkyDance />
}
