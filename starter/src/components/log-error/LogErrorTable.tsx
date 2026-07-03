'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Card,
    Drawer,
    Input,
    Select,
    Spinner,
} from '@/components/ui'
import { HiOutlineEye, HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import LogErrorService from '@/services/log-error.service'
import type { ILogError } from '@/@types/log-error.types'

/* ─── helpers ─────────────────────────────────────────────── */

const LEVEL_CLASS: Record<string, string> = {
    error: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
    warn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    log: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    verbose: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    debug: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
}

const METHOD_CLASS: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    PATCH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    DELETE: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
}

const statusClass = (code: number | null) => {
    if (!code) return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
    if (code >= 500) return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300'
    if (code >= 400) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
    if (code >= 300) return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
}

const formatDate = (s: string) => {
    const d = new Date(s)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const Badge = ({ children, className }: { children: React.ReactNode; className: string }) => (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${className}`}>
        {children}
    </span>
)

/* ─── Detail Drawer ───────────────────────────────────────── */

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5">{label}</dt>
        <dd className="col-span-2 text-sm text-gray-800 dark:text-gray-100 break-all">{value ?? <span className="text-gray-400 italic">—</span>}</dd>
    </div>
)

const LogDetailDrawer = ({
    log,
    onClose,
}: {
    log: ILogError | null
    onClose: () => void
}) => (
    <Drawer
        isOpen={!!log}
        onClose={onClose}
        onRequestClose={onClose}
        title="Detail Log Error"
        width={600}
    >
        {log && (
            <div className="p-4 flex flex-col gap-4">
                {/* Ringkasan */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge className={LEVEL_CLASS[log.level] ?? LEVEL_CLASS.log}>
                        {log.level}
                    </Badge>
                    {log.metode_http && (
                        <Badge className={METHOD_CLASS[log.metode_http] ?? 'bg-gray-100 text-gray-600'}>
                            {log.metode_http}
                        </Badge>
                    )}
                    {log.kode_status && (
                        <Badge className={statusClass(log.kode_status)}>
                            {log.kode_status}
                        </Badge>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(log.dibuat_pada)}</span>
                </div>

                {/* Pesan error */}
                <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3">
                    <p className="text-sm text-red-700 dark:text-red-300 break-all">{log.pesan}</p>
                </div>

                {/* Info */}
                <dl>
                    <DetailRow label="Trace ID" value={log.trace_id} />
                    <DetailRow label="Konteks" value={log.konteks} />
                    <DetailRow label="Jalur" value={log.jalur} />
                    <DetailRow label="ID Pengguna" value={log.id_pengguna} />
                    <DetailRow label="IP" value={log.alamat_ip} />
                    <DetailRow label="User Agent" value={log.user_agent} />
                </dl>

                {/* Stack trace */}
                {log.stack_trace && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Stack Trace</p>
                        <pre className="text-xs bg-gray-900 text-gray-100 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {log.stack_trace}
                        </pre>
                    </div>
                )}

                {/* Metadata */}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Metadata</p>
                        <pre className="text-xs bg-gray-900 text-gray-100 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        )}
    </Drawer>
)

/* ─── Filter options ──────────────────────────────────────── */

type LevelOpt = { value: string; label: string }
const LEVEL_OPTS: LevelOpt[] = [
    { value: '', label: 'Semua Level' },
    { value: 'error', label: 'Error' },
    { value: 'warn', label: 'Warn' },
    { value: 'log', label: 'Log' },
    { value: 'verbose', label: 'Verbose' },
    { value: 'debug', label: 'Debug' },
]

/* ─── Main component ──────────────────────────────────────── */

const LogErrorTable = () => {
    const [data, setData] = useState<ILogError[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)
    const [search, setSearch] = useState('')
    const [level, setLevel] = useState('')
    const [selectedLog, setSelectedLog] = useState<ILogError | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await LogErrorService.getAll({
                page: currentPage,
                limit: pageSize,
                search: search || undefined,
                level: level || undefined,
            })
            if (res.success) {
                setData(res.data)
                setTotal(res.meta.total)
            }
        } catch {
            setData([])
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, search, level])

    useEffect(() => { load() }, [load])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    const columns: ColumnDef<ILogError>[] = [
        {
            header: 'No',
            id: 'no',
            size: 60,
            cell: ({ row }) => (currentPage - 1) * pageSize + row.index + 1,
        },
        {
            header: 'Level',
            id: 'level',
            size: 100,
            cell: ({ row }) => (
                <Badge className={LEVEL_CLASS[row.original.level] ?? LEVEL_CLASS.log}>
                    {row.original.level}
                </Badge>
            ),
        },
        {
            header: 'Method',
            id: 'metode',
            size: 90,
            cell: ({ row }) =>
                row.original.metode_http ? (
                    <Badge className={METHOD_CLASS[row.original.metode_http] ?? 'bg-gray-100 text-gray-600'}>
                        {row.original.metode_http}
                    </Badge>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            header: 'Status',
            id: 'status',
            size: 80,
            cell: ({ row }) =>
                row.original.kode_status ? (
                    <Badge className={statusClass(row.original.kode_status)}>
                        {row.original.kode_status}
                    </Badge>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            header: 'Konteks',
            id: 'konteks',
            size: 160,
            cell: ({ row }) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    {row.original.konteks ?? '—'}
                </span>
            ),
        },
        {
            header: 'Pesan',
            id: 'pesan',
            size: 320,
            cell: ({ row }) => (
                <span className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                    {row.original.pesan}
                </span>
            ),
        },
        {
            header: 'Waktu',
            id: 'waktu',
            size: 160,
            cell: ({ row }) => (
                <span className="text-xs text-gray-500">{formatDate(row.original.dibuat_pada)}</span>
            ),
        },
        {
            header: 'Aksi',
            id: 'aksi',
            size: 80,
            cell: ({ row }) => (
                <span
                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                    onClick={() => setSelectedLog(row.original)}
                    title="Lihat detail"
                >
                    <HiOutlineEye className="text-lg" />
                </span>
            ),
        },
    ]

    const selectedLevel = LEVEL_OPTS.find((o) => o.value === level) ?? LEVEL_OPTS[0]

    return (
        <>
            <Card
                header={{
                    content: <h4>Log Error</h4>,
                    extra: (
                        <Button
                            size="sm"
                            icon={<HiOutlineRefresh />}
                            onClick={load}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* Filter bar */}
                <div className="flex items-center gap-3 px-4 pb-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            className="pl-9"
                            placeholder="Cari pesan, jalur, konteks…"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="w-40">
                        <Select<LevelOpt>
                            options={LEVEL_OPTS}
                            value={selectedLevel}
                            onChange={(opt) => {
                                setLevel((opt as LevelOpt).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={32} />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        pagingData={{
                            total,
                            pageIndex: currentPage,
                            pageSize,
                        }}
                        onPaginationChange={setCurrentPage}
                        onSelectChange={() => {}}
                    />
                )}
            </Card>

            <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
        </>
    )
}

export default LogErrorTable
