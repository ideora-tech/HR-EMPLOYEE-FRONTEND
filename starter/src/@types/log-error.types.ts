export interface ILogError {
    id_log_error: string
    level: string
    pesan: string
    stack_trace: string | null
    konteks: string | null
    metode_http: string | null
    jalur: string | null
    kode_status: number | null
    id_pengguna: string | null
    trace_id: string | null
    alamat_ip: string | null
    user_agent: string | null
    metadata: Record<string, unknown> | null
    dibuat_pada: string
}

export interface ILogErrorQuery {
    page?: number
    limit?: number
    search?: string
    level?: string
    kode_status?: number
}
