// ─── Jenis Exit ───────────────────────────────────────────────────────────────

export type JenisExit =
    | 'RESIGN'
    | 'TERMINASI'
    | 'PENSIUN'
    | 'KONTRAK_BERAKHIR'
    | 'KESEPAKATAN_BERSAMA'
    | 'MENINGGAL_DUNIA'

// ─── Karyawan Exit ────────────────────────────────────────────────────────────

export interface IKaryawanExit {
    id_exit: string
    id_karyawan: string
    jenis_exit: JenisExit
    tanggal_pengajuan: string
    hari_kerja_terakhir: string
    tanggal_efektif_keluar: string
    alasan: string | null
    catatan_internal: string | null
    dapat_direkrut_kembali: 0 | 1
    catatan_rehire: string | null
    dibuat_pada: string
    diubah_pada: string | null
    karyawan: {
        id_karyawan: string
        nik: string | null
        nama: string
        email: string | null
        telepon: string | null
    } | null
}

export interface ICreateKaryawanExit {
    id_karyawan: string
    jenis_exit: JenisExit
    tanggal_pengajuan: string
    hari_kerja_terakhir: string
    tanggal_efektif_keluar: string
    alasan?: string
    catatan_internal?: string
    dapat_direkrut_kembali?: 0 | 1
    catatan_rehire?: string
}

export type IUpdateKaryawanExit = Partial<
    Omit<ICreateKaryawanExit, 'id_karyawan'>
>

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface IKaryawanExitQuery {
    search?: string
    jenis_exit?: JenisExit | ''
    page?: number
    limit?: number
}
