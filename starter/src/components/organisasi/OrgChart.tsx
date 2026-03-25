'use client'

import { useState } from 'react'
import { Avatar, Tag, Spinner } from '@/components/ui'
import {
    HiChevronDown,
    HiChevronRight,
    HiOutlineUserGroup,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
} from 'react-icons/hi'
import acronym from '@/utils/acronym'
import type {
    IOrgChartDepartemen,
    IOrgChartJabatan,
    IOrgChartKaryawan,
    IOrgChartStruktur,
} from '@/@types/organisasi.types'

// ─── Level styles ─────────────────────────────────────────────────────────────
const LEVEL_STYLES: Record<number, { tag: string; label: string }> = {
    1: {
        tag: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
        label: 'Top Management',
    },
    2: {
        tag: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        label: 'Middle Management',
    },
    3: {
        tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        label: 'Supervisor',
    },
    4: {
        tag: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
        label: 'Staff',
    },
}

const STATUS_STYLES: Record<string, string> = {
    TETAP: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    KONTRAK: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    MAGANG: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    PTSP: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
}

// Dept header background per depth
const DEPTH_HEADER: string[] = [
    'bg-blue-50 text-blue-700 border-b border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    'bg-indigo-50 text-indigo-700 border-b border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    'bg-violet-50 text-violet-700 border-b border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
    'bg-fuchsia-50 text-fuchsia-700 border-b border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:border-fuchsia-500/20',
]

// ─── Count total karyawan in a dept (recursive) ───────────────────────────────
function countKaryawan(dept: IOrgChartDepartemen): number {
    const fromJabatan = dept.jabatan.reduce((s, j) => s + j.karyawan.length, 0)
    const fromChildren = dept.sub_departemen.reduce((s, sub) => s + countKaryawan(sub), 0)
    return fromJabatan + fromChildren
}

// ─── KaryawanCard ─────────────────────────────────────────────────────────────
const KaryawanCard = ({ karyawan }: { karyawan: IOrgChartKaryawan }) => {
    const statusCls =
        STATUS_STYLES[karyawan.status_kepegawaian] ??
        'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300'
    return (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <Avatar
                size={32}
                src={karyawan.foto_url ?? undefined}
                className="flex-shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-bold"
            >
                {acronym(karyawan.nama)}
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {karyawan.nama}
                </p>
                <p className="text-xs text-gray-400 font-mono">{karyawan.nik}</p>
            </div>
            <Tag className={`text-xs flex-shrink-0 ${statusCls}`}>
                {karyawan.status_kepegawaian}
            </Tag>
        </div>
    )
}

// ─── JabatanRow ───────────────────────────────────────────────────────────────
const JabatanRow = ({ jabatan }: { jabatan: IOrgChartJabatan }) => {
    const [expanded, setExpanded] = useState(false)
    const levelStyle = jabatan.level != null ? LEVEL_STYLES[jabatan.level] : null

    return (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="text-gray-400 flex-shrink-0">
                    {expanded ? <HiChevronDown /> : <HiChevronRight />}
                </span>
                <HiOutlineBriefcase className="text-gray-400 flex-shrink-0" />
                <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                    {jabatan.kode}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100 flex-1 text-sm">
                    {jabatan.nama}
                </span>
                {levelStyle && (
                    <Tag className={`text-xs flex-shrink-0 ${levelStyle.tag}`}>
                        {levelStyle.label}
                    </Tag>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-500 ml-2 flex-shrink-0">
                    <HiOutlineUserGroup />
                    <span>{jabatan.karyawan.length}</span>
                </span>
            </button>

            {expanded && (
                <div className="p-3 bg-white dark:bg-gray-900/30">
                    {jabatan.karyawan.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {jabatan.karyawan.map((kar) => (
                                <KaryawanCard key={kar.id_karyawan} karyawan={kar} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-1 text-center">
                            Belum ada karyawan pada jabatan ini.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── DepartemenNode (recursive) ───────────────────────────────────────────────
const DepartemenNode = ({
    dept,
    depth = 0,
}: {
    dept: IOrgChartDepartemen
    depth?: number
}) => {
    const [expanded, setExpanded] = useState(true)
    const headerCls = DEPTH_HEADER[Math.min(depth, DEPTH_HEADER.length - 1)]
    const totalKar = countKaryawan(dept)

    return (
        <div
            className={
                depth > 0
                    ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4'
                    : ''
            }
        >
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mb-4">
                {/* Department header / toggle */}
                <button
                    className={`w-full flex items-center gap-3 px-5 py-3.5 ${headerCls} hover:brightness-95 transition-all text-left`}
                    onClick={() => setExpanded(!expanded)}
                >
                    <span className="flex-shrink-0">
                        {expanded ? <HiChevronDown /> : <HiChevronRight />}
                    </span>
                    <HiOutlineOfficeBuilding className="flex-shrink-0" />
                    <span className="bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-sm font-bold flex-shrink-0">
                        {dept.kode}
                    </span>
                    <span className="font-semibold flex-1 truncate">{dept.nama}</span>
                    <div className="hidden sm:flex items-center gap-4 text-sm opacity-90 flex-shrink-0">
                        {dept.jabatan.length > 0 && (
                            <span className="flex items-center gap-1">
                                <HiOutlineBriefcase />
                                {dept.jabatan.length} jabatan
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <HiOutlineUserGroup />
                            {totalKar} karyawan
                        </span>
                        {dept.sub_departemen.length > 0 && (
                            <span>{dept.sub_departemen.length} sub</span>
                        )}
                    </div>
                </button>

                {/* Jabatan list */}
                {expanded && (
                    <div className="p-4 flex flex-col gap-2.5">
                        {dept.jabatan.length > 0 ? (
                            dept.jabatan.map((jab) => (
                                <JabatanRow key={jab.id_jabatan} jabatan={jab} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-2">
                                Belum ada jabatan dalam departemen ini.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Sub-departments */}
            {expanded && dept.sub_departemen.length > 0 && (
                <div>
                    {dept.sub_departemen.map((sub) => (
                        <DepartemenNode key={sub.id_departemen} dept={sub} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main OrgChart ────────────────────────────────────────────────────────────
interface OrgChartProps {
    data: IOrgChartStruktur | null
    loading?: boolean
}

const OrgChart = ({ data, loading = false }: OrgChartProps) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spinner size={40} />
            </div>
        )
    }

    if (!data) return null

    return (
        <div>
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                        Total Departemen
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                        {data.total_departemen}
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                        Total Karyawan
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                        {data.total_karyawan}
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                        Tanpa Departemen
                    </span>
                    <span className="text-2xl font-bold text-orange-500">
                        {data.karyawan_tanpa_departemen.length}
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                        Departemen Utama
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                        {data.departemen.length}
                    </span>
                </div>
            </div>

            {/* Tree */}
            {data.departemen.length > 0 ? (
                data.departemen.map((dept) => (
                    <DepartemenNode key={dept.id_departemen} dept={dept} depth={0} />
                ))
            ) : (
                <div className="text-center py-12 text-gray-400">
                    Belum ada data departemen.
                </div>
            )}

            {/* Karyawan tanpa departemen */}
            {data.karyawan_tanpa_departemen.length > 0 && (
                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-2">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-100 text-gray-600 border-b border-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:border-gray-600">
                        <HiOutlineUserGroup className="flex-shrink-0" />
                        <span className="font-semibold flex-1">
                            Karyawan Tanpa Departemen
                        </span>
                        <span className="text-sm opacity-90">
                            {data.karyawan_tanpa_departemen.length} karyawan
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
                        {data.karyawan_tanpa_departemen.map((kar) => (
                            <KaryawanCard key={kar.id_karyawan} karyawan={kar} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrgChart
