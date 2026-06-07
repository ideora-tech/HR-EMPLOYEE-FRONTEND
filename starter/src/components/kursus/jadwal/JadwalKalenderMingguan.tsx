'use client'

import { useState, useEffect, useCallback } from 'react'
import { HiChevronLeft, HiChevronRight, HiOutlineBan, HiOutlineRefresh } from 'react-icons/hi'
import { toast, Notification } from '@/components/ui'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import { parseApiError } from '@/utils/parseApiError'
import type { IJadwalKalenderResponse, IJadwalKelas, ICancelKelas, ISesiPengganti } from '@/@types/kursus.types'
import LiburForm from './LiburForm'
import CancelKelasModal from './CancelKelasModal'
import SesiPenggantiConfirmModal from './SesiPenggantiConfirmModal'
import SiswaTerdampakDrawer from './SiswaTerdampakDrawer'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d
}

function toYMD(date: Date): string {
    return date.toISOString().split('T')[0]
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

function fmtLabel(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short',
    })
}

const KOLOM_HARI = [
    { dayIndex: 1, label: 'Senin' },
    { dayIndex: 2, label: 'Selasa' },
    { dayIndex: 3, label: 'Rabu' },
    { dayIndex: 4, label: 'Kamis' },
    { dayIndex: 5, label: 'Jumat' },
    { dayIndex: 6, label: 'Sabtu' },
    { dayIndex: 0, label: 'Minggu' },
]

const CARD_COLORS = [
    { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-900',   badge: 'bg-blue-100' },
    { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-900',  badge: 'bg-green-100' },
    { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-900',  badge: 'bg-amber-100' },
    { bg: 'bg-pink-50',   border: 'border-pink-300',   text: 'text-pink-900',   badge: 'bg-pink-100' },
    { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-900', badge: 'bg-violet-100' },
    { bg: 'bg-rose-50',   border: 'border-rose-300',   text: 'text-rose-900',   badge: 'bg-rose-100' },
    { bg: 'bg-teal-50',   border: 'border-teal-300',   text: 'text-teal-900',   badge: 'bg-teal-100' },
]

function getCardColor(namaKelas: string | null) {
    if (!namaKelas) return CARD_COLORS[0]
    let hash = 0
    for (let i = 0; i < namaKelas.length; i++) {
        hash = namaKelas.charCodeAt(i) + ((hash << 5) - hash)
    }
    return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}

// ─── Component ────────────────────────────────────────────────────────────────

type KalenderData = IJadwalKalenderResponse

export default function JadwalKalenderMingguan() {
    const [weekMonday, setWeekMonday] = useState<Date>(() => getMondayOfWeek(new Date()))
    const [data, setData] = useState<KalenderData>({ jadwal: [], libur: [], cancel: [], sesi_pengganti: [] })
    const [loading, setLoading] = useState(false)

    const [liburFormOpen, setLiburFormOpen] = useState(false)
    const [liburTargetTanggal, setLiburTargetTanggal] = useState<string>('')
    const [cancelModal, setCancelModal] = useState<{ open: boolean; jadwal: IJadwalKelas | null; tanggal: string }>({
        open: false, jadwal: null, tanggal: '',
    })
    const [penggantiModal, setPenggantiModal] = useState<{ open: boolean; sesi: ISesiPengganti | null }>({
        open: false, sesi: null,
    })
    const [siswaTerdampakDrawer, setSiswaTerdampakDrawer] = useState<{ open: boolean; idCancel: string }>({
        open: false, idCancel: '',
    })

    const weekStart = toYMD(weekMonday)
    const weekEnd   = toYMD(addDays(weekMonday, 6))

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await ApiService.fetchDataWithAxios<{ data: KalenderData }>({
                url: API_ENDPOINTS.KURSUS.JADWAL.KALENDER,
                method: 'GET',
                params: { week_start: weekStart, week_end: weekEnd },
            })
            setData(res.data)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoading(false)
        }
    }, [weekStart, weekEnd])

    useEffect(() => { fetchData() }, [fetchData])

    const goPrev  = () => setWeekMonday(d => addDays(d, -7))
    const goNext  = () => setWeekMonday(d => addDays(d,  7))
    const goToday = () => setWeekMonday(getMondayOfWeek(new Date()))

    const todayStr = toYMD(new Date())
    const pendingCount = data.sesi_pengganti.filter(s => s.status === 1).length

    return (
        <div>
            {/* Week navigator */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goPrev}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                    >
                        <HiChevronLeft className="text-base" />
                    </button>
                    <span className="text-sm font-semibold min-w-[200px] text-center">
                        {fmtLabel(weekStart)} – {fmtLabel(weekEnd)} {new Date(weekStart + 'T12:00:00').getFullYear()}
                    </span>
                    <button
                        onClick={goNext}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                    >
                        <HiChevronRight className="text-base" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                            {pendingCount} pengganti menunggu konfirmasi
                        </span>
                    )}
                    <button
                        onClick={goToday}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                        Hari Ini
                    </button>
                    <button
                        onClick={fetchData}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400"
                        title="Refresh"
                    >
                        <HiOutlineRefresh className={`text-base ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="overflow-x-auto">
                <div className="grid grid-cols-7 min-w-[700px]">
                    {/* Headers */}
                    {KOLOM_HARI.map(({ dayIndex, label }) => {
                        const diff = dayIndex === 0 ? 6 : dayIndex - 1
                        const colDate = toYMD(addDays(weekMonday, diff))
                        const isToday = colDate === todayStr
                        const dayNum = new Date(colDate + 'T12:00:00').getDate()
                        const hasLibur = data.libur.some(l => l.tanggal === colDate)

                        return (
                            <div
                                key={label}
                                className={`border-r border-b border-gray-100 last:border-r-0 py-2 px-2 text-center group relative
                                    ${isToday ? 'bg-indigo-50' : 'bg-white'}`}
                            >
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1
                                    ${isToday ? 'text-indigo-500' : 'text-gray-400'}`}>
                                    {label}
                                </p>
                                <p className={`text-xl font-extrabold leading-none
                                    ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                                    {dayNum}
                                </p>
                                {isToday && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1" />}
                                {!hasLibur && (
                                    <button
                                        onClick={() => { setLiburTargetTanggal(colDate); setLiburFormOpen(true) }}
                                        className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1
                                            text-[10px] font-medium text-red-500 bg-red-50 border border-red-200
                                            rounded px-1.5 py-0.5 hover:bg-red-100"
                                        title="Tutup semua kelas hari ini"
                                    >
                                        <HiOutlineBan className="text-xs" />
                                        Tutup
                                    </button>
                                )}
                            </div>
                        )
                    })}

                    {/* Body cells */}
                    {KOLOM_HARI.map(({ dayIndex, label }) => {
                        const diff = dayIndex === 0 ? 6 : dayIndex - 1
                        const colDate = toYMD(addDays(weekMonday, diff))
                        const isToday = colDate === todayStr

                        const liburHariIni = data.libur.find(l => l.tanggal === colDate)
                        const cancelHariIni = data.cancel.filter(c => c.tanggal === colDate)
                        const penggantiHariIni = data.sesi_pengganti.filter(s => s.tanggal === colDate)
                        const cancelledJadwalIds = new Set(cancelHariIni.map(c => c.id_jadwal_kelas))
                        const jadwalHariIni = data.jadwal.filter(j => j.hari === label)

                        return (
                            <div
                                key={label}
                                className={`border-r border-gray-100 last:border-r-0 p-1.5 min-h-[240px] flex flex-col gap-1.5
                                    ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}
                            >
                                {liburHariIni && (
                                    <div className="mb-1 rounded-lg bg-red-50 border border-red-200 px-2 py-1.5 text-center">
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">LIBUR</p>
                                        <p className="text-[10px] text-red-400 mt-0.5 leading-tight">{liburHariIni.keterangan}</p>
                                    </div>
                                )}

                                {jadwalHariIni.map(jadwal => {
                                    const isCancelled = cancelledJadwalIds.has(jadwal.id_jadwal_kelas)
                                    const cancelRecord = cancelHariIni.find(c => c.id_jadwal_kelas === jadwal.id_jadwal_kelas)
                                    const color = getCardColor(jadwal.nama_kelas)

                                    if (isCancelled) {
                                        return (
                                            <div
                                                key={jadwal.id_jadwal_kelas}
                                                className="rounded-lg px-2 py-1.5 bg-gray-100 border border-gray-200 opacity-60 cursor-pointer hover:opacity-80"
                                                onClick={() => cancelRecord && setSiswaTerdampakDrawer({ open: true, idCancel: cancelRecord.id_cancel })}
                                            >
                                                <p className="text-[10px] font-semibold text-gray-400 line-through">{jadwal.jam_mulai} – {jadwal.jam_selesai}</p>
                                                <p className="text-[11px] font-bold text-gray-400 line-through">{jadwal.nama_kelas}</p>
                                                <p className="text-[10px] text-gray-400">Dibatalkan</p>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div
                                            key={jadwal.id_jadwal_kelas}
                                            className={`rounded-lg px-2 py-1.5 border-l-[3px] cursor-pointer
                                                hover:-translate-y-0.5 hover:shadow-md transition-all
                                                ${color.bg} ${color.border} ${color.text}`}
                                            onClick={() => setCancelModal({ open: true, jadwal, tanggal: colDate })}
                                        >
                                            <p className="text-[10px] font-bold opacity-75">{jadwal.jam_mulai} – {jadwal.jam_selesai}</p>
                                            <p className="text-[11px] font-bold leading-tight">{jadwal.nama_kelas}</p>
                                            <p className="text-[10px] opacity-70">{jadwal.nama_karyawan}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${color.badge}`}>
                                                    {jadwal.nama_kategori_umur}
                                                </span>
                                                <span className={`text-[10px] font-semibold opacity-65 ${jadwal.kuota_terpakai >= (jadwal.kuota ?? 0) ? 'text-red-600 opacity-100' : ''}`}>
                                                    {jadwal.kuota_terpakai}/{jadwal.kuota}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {penggantiHariIni.map(sesi => (
                                    <div
                                        key={sesi.id_sesi_pengganti}
                                        className={`rounded-lg px-2 py-1.5 border-l-[3px] cursor-pointer
                                            hover:-translate-y-0.5 hover:shadow-md transition-all
                                            ${sesi.status === 1
                                                ? 'bg-amber-50 border-amber-400 text-amber-900'
                                                : 'bg-orange-50 border-orange-400 text-orange-900'
                                            }`}
                                        onClick={() => setPenggantiModal({ open: true, sesi })}
                                    >
                                        <p className="text-[10px] font-bold opacity-75">{sesi.jam_mulai} – {sesi.jam_selesai}</p>
                                        <p className="text-[11px] font-bold leading-tight">{sesi.nama_kelas}</p>
                                        <p className="text-[10px] opacity-70">{sesi.nama_karyawan}</p>
                                        <div className="mt-1">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
                                                ${sesi.status === 1 ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {sesi.status === 1 ? 'MENUNGGU ●' : 'PENGGANTI ✓'}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {jadwalHariIni.length === 0 && penggantiHariIni.length === 0 && !liburHariIni && (
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-[11px] text-gray-300">–</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                {[
                    { color: 'bg-blue-50 border border-blue-300', label: 'Kelas reguler' },
                    { color: 'bg-gray-100 border border-gray-200 opacity-60', label: 'Dibatalkan' },
                    { color: 'bg-amber-50 border border-amber-400', label: 'Pengganti (menunggu)' },
                    { color: 'bg-orange-50 border border-orange-400', label: 'Pengganti (dikonfirmasi)' },
                    { color: 'bg-red-50 border border-red-200', label: 'Hari libur' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Modals */}
            <LiburForm
                open={liburFormOpen}
                tanggalDefault={liburTargetTanggal}
                onClose={() => setLiburFormOpen(false)}
                onSuccess={() => { setLiburFormOpen(false); fetchData() }}
            />
            <CancelKelasModal
                open={cancelModal.open}
                jadwal={cancelModal.jadwal}
                tanggal={cancelModal.tanggal}
                onClose={() => setCancelModal({ open: false, jadwal: null, tanggal: '' })}
                onSuccess={() => { setCancelModal({ open: false, jadwal: null, tanggal: '' }); fetchData() }}
            />
            <SesiPenggantiConfirmModal
                open={penggantiModal.open}
                sesi={penggantiModal.sesi}
                onClose={() => setPenggantiModal({ open: false, sesi: null })}
                onSuccess={() => { setPenggantiModal({ open: false, sesi: null }); fetchData() }}
            />
            <SiswaTerdampakDrawer
                open={siswaTerdampakDrawer.open}
                idCancel={siswaTerdampakDrawer.idCancel}
                onClose={() => setSiswaTerdampakDrawer({ open: false, idCancel: '' })}
            />
        </div>
    )
}
