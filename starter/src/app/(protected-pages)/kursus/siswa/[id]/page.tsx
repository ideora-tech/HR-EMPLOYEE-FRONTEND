'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Notification, toast } from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ConvertTrialModal from '@/components/kursus/siswa/ConvertTrialModal'
import ChangeTrialKelasModal from '@/components/kursus/siswa/ChangeTrialKelasModal'
import EditKelasModal from '@/components/kursus/siswa/EditKelasModal'
import SiswaDetailHeader from '@/components/kursus/siswa/SiswaDetailHeader'
import SiswaKelasTable from '@/components/kursus/siswa/SiswaKelasTable'
import SiswaTagihanTable from '@/components/kursus/siswa/SiswaTagihanTable'
import SiswaService from '@/services/kursus/siswa.service'
import TagihanService from '@/services/kursus/tagihan.service'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { ROUTES } from '@/constants/route.constant'
import type { ISiswa, ITagihan, ISiswaKelasItem } from '@/@types/kursus.types'

const SiswaDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const idSiswa = params.id as string

    const [siswa, setSiswa] = useState<ISiswa | null>(null)
    const [tagihan, setTagihan] = useState<ITagihan[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingTagihan, setLoadingTagihan] = useState(true)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [convertTarget, setConvertTarget] = useState<ISiswaKelasItem | null>(null)
    const [changeKelasTarget, setChangeKelasTarget] = useState<ISiswaKelasItem | null>(null)
    const [editKelasTarget, setEditKelasTarget] = useState<ISiswaKelasItem | null>(null)
    const [hapusKelasTarget, setHapusKelasTarget] = useState<ISiswaKelasItem | null>(null)
    const [hapusKelasLoading, setHapusKelasLoading] = useState(false)

    const fetchSiswa = useCallback(async () => {
        try {
            const res = await SiswaService.getById(idSiswa)
            if (res.success) setSiswa(res.data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data siswa">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [idSiswa])

    const fetchTagihan = useCallback(async () => {
        setLoadingTagihan(true)
        try {
            const res = await TagihanService.getBySiswa(idSiswa)
            if (res.success) setTagihan(res.data)
        } catch {
            setTagihan([])
        } finally {
            setLoadingTagihan(false)
        }
    }, [idSiswa])

    useEffect(() => {
        fetchSiswa()
        fetchTagihan()
    }, [fetchSiswa, fetchTagihan])

    const handleHapusKelas = async () => {
        if (!hapusKelasTarget) return
        setHapusKelasLoading(true)
        try {
            await CatatKelasSiswaService.remove(hapusKelasTarget.id_catat)
            toast.push(<Notification type="success" title="Kelas berhasil dihapus dari siswa" />)
            setHapusKelasTarget(null)
            fetchSiswa()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menghapus kelas">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setHapusKelasLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!siswa) return
        setDeleting(true)
        try {
            await SiswaService.remove(siswa.id_siswa)
            toast.push(<Notification type="success" title="Siswa berhasil dihapus" />)
            router.push(ROUTES.KURSUS_SISWA)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menghapus siswa">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setDeleting(false)
            setDeleteOpen(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64 text-sm text-gray-400">
                Memuat...
            </div>
        )
    }

    if (!siswa) {
        return (
            <div className="flex items-center justify-center min-h-64 text-sm text-gray-400">
                Siswa tidak ditemukan.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Back */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push(ROUTES.KURSUS_SISWA)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h3 className="font-bold">Detail Siswa</h3>
                    <p className="text-gray-500 text-sm mt-0.5">Informasi lengkap siswa terdaftar</p>
                </div>
            </div>

            {/* Header info siswa */}
            <SiswaDetailHeader
                siswa={siswa}
                onEdit={() => router.push(ROUTES.KURSUS_SISWA_EDIT(siswa.id_siswa))}
                onInputKelas={() => router.push(ROUTES.KURSUS_SISWA_ASSIGN_KELAS(siswa.id_siswa))}
                onHapus={() => setDeleteOpen(true)}
            />

            {/* Riwayat Kelas */}
            <Card bodyClass="px-0 pb-4">
                <div className="px-5 pt-4 pb-3">
                    <h5>Riwayat Kelas</h5>
                </div>
                <SiswaKelasTable
                    data={siswa.kelas ?? []}
                    onConvert={(item) => setConvertTarget(item)}
                    onChangeKelas={(item) => setChangeKelasTarget(item)}
                    onEdit={(item) => setEditKelasTarget(item)}
                    onHapus={(item) => setHapusKelasTarget(item)}
                />
            </Card>

            {/* Riwayat Tagihan */}
            <Card bodyClass="px-0 pb-4">
                <div className="px-5 pt-4 pb-3">
                    <h5>Riwayat Tagihan & Pembayaran</h5>
                </div>
                <SiswaTagihanTable data={tagihan} loading={loadingTagihan} />
            </Card>

            <EditKelasModal
                isOpen={!!editKelasTarget}
                item={editKelasTarget}
                onClose={() => setEditKelasTarget(null)}
                onSuccess={() => {
                    setEditKelasTarget(null)
                    fetchSiswa()
                }}
            />

            <ConfirmDialog
                isOpen={!!hapusKelasTarget}
                type="danger"
                title="Hapus Kelas?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: hapusKelasLoading,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setHapusKelasTarget(null)}
                onCancel={() => setHapusKelasTarget(null)}
                onConfirm={handleHapusKelas}
            >
                <p className="text-sm">
                    Siswa akan dikeluarkan dari kelas{' '}
                    <span className="font-semibold">&ldquo;{hapusKelasTarget?.nama_kelas}&rdquo;</span>.
                    Data presensi yang sudah ada tidak akan terhapus.
                </p>
            </ConfirmDialog>

            <ChangeTrialKelasModal
                isOpen={!!changeKelasTarget}
                trialItem={changeKelasTarget}
                onClose={() => setChangeKelasTarget(null)}
                onSuccess={() => {
                    setChangeKelasTarget(null)
                    fetchSiswa()
                }}
            />

            <ConvertTrialModal
                isOpen={!!convertTarget}
                trialItem={convertTarget}
                onClose={() => setConvertTarget(null)}
                onSuccess={() => {
                    setConvertTarget(null)
                    toast.push(<Notification type="success" title="Trial berhasil dikonversi ke kelas reguler" />)
                    fetchSiswa()
                    fetchTagihan()
                }}
            />

            {/* Confirm Hapus */}
            <ConfirmDialog
                isOpen={deleteOpen}
                type="danger"
                title="Hapus Siswa?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: deleting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setDeleteOpen(false)}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            >
                <p className="text-sm">
                    Data siswa{' '}
                    <span className="font-semibold">&ldquo;{siswa.nama_siswa}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default SiswaDetailPage
