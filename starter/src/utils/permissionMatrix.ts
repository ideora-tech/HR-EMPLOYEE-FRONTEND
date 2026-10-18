import type { IItemIzin } from '@/@types/peran.types'

/** Aksi standar = kolom matriks; aksi lain tampil di kolom "Aksi khusus". Sama dengan POS_IDEORA. */
export const STANDARD_ACTIONS = ['view', 'create', 'update', 'delete'] as const
export type StandardAction = (typeof STANDARD_ACTIONS)[number]

export const ACTION_LABEL: Record<StandardAction, string> = {
    view: 'Lihat',
    create: 'Tambah',
    update: 'Ubah',
    delete: 'Hapus',
}

export type MatrixRow = {
    menu: string
    label: string
    group: string
    urutan: number
    standard: Partial<Record<StandardAction, string>>
    special: { code: string; name: string }[]
}

export type MatrixLine =
    | { kind: 'grup'; key: string; title: string }
    | { kind: 'izin'; row: MatrixRow }

const splitCode = (code: string): { menu: string; action: string } => {
    const dot = code.indexOf('.')
    return dot === -1 ? { menu: code, action: '' } : { menu: code.slice(0, dot), action: code.slice(dot + 1) }
}

const isStandardAction = (action: string): action is StandardAction =>
    (STANDARD_ACTIONS as readonly string[]).includes(action)

/** Satu baris per menu; label diambil dari nama izin "Lihat <menu>". */
export function buildMatrix(catalog: IItemIzin[]): MatrixRow[] {
    const byMenu = new Map<string, MatrixRow>()
    for (const izin of catalog) {
        const { menu, action } = splitCode(izin.kode)
        let row = byMenu.get(menu)
        if (!row) {
            row = { menu, label: menu, group: izin.grup, urutan: izin.urutan, standard: {}, special: [] }
            byMenu.set(menu, row)
        }
        row.urutan = Math.min(row.urutan, izin.urutan)
        if (isStandardAction(action)) {
            row.standard[action] = izin.kode
            if (action === 'view') row.label = izin.nama.replace(/^Lihat\s+/i, '')
        } else {
            row.special.push({ code: izin.kode, name: izin.nama })
        }
    }
    return [...byMenu.values()].sort((a, b) => a.urutan - b.urutan)
}

/** Baris dikelompokkan per grup katalog (urutan katalog dipertahankan). */
export function buildGroupedMatrix(catalog: IItemIzin[], search = ''): MatrixLine[] {
    const keyword = search.trim().toLowerCase()
    const rows = buildMatrix(catalog).filter(
        (row) =>
            !keyword ||
            row.label.toLowerCase().includes(keyword) ||
            row.group.toLowerCase().includes(keyword) ||
            row.special.some((s) => s.name.toLowerCase().includes(keyword)),
    )
    const lines: MatrixLine[] = []
    let currentGroup: string | null = null
    for (const row of rows) {
        if (row.group !== currentGroup) {
            lines.push({ kind: 'grup', key: row.group, title: row.group })
            currentGroup = row.group
        }
        lines.push({ kind: 'izin', row })
    }
    return lines
}

export function rowCodes(row: MatrixRow): string[] {
    return [...Object.values(row.standard), ...row.special.map((s) => s.code)]
}

/** Centang "Semua" pada satu baris: semua tercentang → kosongkan; selain itu → centang semua. */
export function toggleRow(row: MatrixRow, checked: Set<string>): Set<string> {
    const codes = rowCodes(row)
    const next = new Set(checked)
    const allChecked = codes.every((c) => next.has(c))
    for (const c of codes) {
        if (allChecked) next.delete(c)
        else next.add(c)
    }
    return next
}
