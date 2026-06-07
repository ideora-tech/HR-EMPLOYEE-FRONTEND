interface ReminderItem {
    id_siswa: string
    nama_siswa: string
    nama_kelas: string
    jadwal_label: string
    sesi_tersisa: number
}

const ReminderList = ({ items }: { items: ReminderItem[] }) => {
    if (items.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-8">Tidak ada siswa yang sesi-nya hampir habis</p>
    }
    return (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map(item => (
                <li key={item.id_siswa} className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                        {item.nama_siswa.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.nama_siswa}</p>
                        <p className="text-xs text-gray-400">{item.nama_kelas} · {item.jadwal_label}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-amber-600 leading-tight">{item.sesi_tersisa}</p>
                        <p className="text-xs text-gray-400">sesi tersisa</p>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default ReminderList
