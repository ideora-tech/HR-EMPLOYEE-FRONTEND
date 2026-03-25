export type AksiType = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE'

export const AKSI_LIST: AksiType[] = ['VIEW', 'CREATE', 'UPDATE', 'DELETE']

export interface IzinPeranMenuItem {
    id_menu: string
    path: string
    nama_menu: string
    kode_modul: string
    aksi: AksiType[]
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}
