export interface ILangganan {
    id_langganan: string
    paket: string
    maks_karyawan: number
    aktif: number
    dibuat_pada: string
}

export interface IModulAkses {
    kode_modul: string
    nama: string
    batasan: Record<string, number> | null
}

export interface IZonaWaktu {
    id_zona: string
    kode: string
    nama: string
    offset_utc: string
    urutan: number
    aktif: number
}

export interface IMataUang {
    id_mata_uang: string
    kode: string
    nama: string
    simbol: string
    urutan: number
    aktif: number
}

export interface IPerusahaan {
    id_perusahaan: string
    nama: string
    email: string | null
    telepon: string | null
    alamat: string | null
    zona_waktu: string | null
    mata_uang: string | null
    npwp: string | null
    website: string | null
    url_logo: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    total_pengguna?: number
    langganan?: ILangganan | null
}

export interface IPerusahaanOverview extends IPerusahaan {
    total_pengguna: number
    langganan: ILangganan | null
    modul: IModulAkses[]
}

export interface IPerusahaanCreate {
    nama: string
    email?: string
    telepon?: string
    alamat?: string
    zona_waktu?: string
    mata_uang?: string
    npwp?: string
    website?: string
    url_logo?: string
}

export interface IPerusahaanUpdate {
    nama?: string
    email?: string
    telepon?: string
    alamat?: string
    zona_waktu?: string
    mata_uang?: string
    npwp?: string
    website?: string
    url_logo?: string
    aktif?: number
}

export interface IPerusahaanQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface ApiPaginatedResponse<T> {
    success: boolean
    message: string
    data: T[]
    meta?: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}
