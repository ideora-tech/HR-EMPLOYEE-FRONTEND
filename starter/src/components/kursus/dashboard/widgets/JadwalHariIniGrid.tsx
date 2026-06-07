interface JadwalItem {
    id_jadwal_kelas: string
    nama_kelas: string
    nama_karyawan: string | null
    jam_mulai: string
    jam_selesai: string
    kuota: number
    kuota_terpakai: number
}

const JadwalHariIniGrid = ({ items }: { items: JadwalItem[] }) => {
    if (items.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-8 col-span-4">Tidak ada jadwal hari ini</p>
    }
    return (
        <>
            {items.map(j => {
                const pct = j.kuota > 0 ? Math.round((j.kuota_terpakai / j.kuota) * 100) : 0
                const isFull = j.kuota_terpakai >= j.kuota
                const barColor = isFull ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                const cardBg = isFull ? 'bg-red-50/60 dark:bg-red-500/5 border-red-200 dark:border-red-500/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                return (
                    <div key={j.id_jadwal_kelas} className={`rounded-xl border p-4 ${cardBg}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{j.nama_kelas}</p>
                                <p className="text-xs text-gray-400 mt-0.5">⏰ {j.jam_mulai} – {j.jam_selesai}</p>
                            </div>
                            {isFull && (
                                <span className="text-xs font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-full shrink-0">PENUH</span>
                            )}
                        </div>
                        {j.nama_karyawan && (
                            <p className="text-xs text-gray-500 mb-3">👤 {j.nama_karyawan}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span>Kuota Terisi</span>
                            <span className="font-bold text-gray-700 dark:text-gray-200">{j.kuota_terpakai} / {j.kuota}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default JadwalHariIniGrid
