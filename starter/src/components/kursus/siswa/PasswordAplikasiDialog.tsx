'use client'

import { useEffect, useState } from 'react'
import { Button, Dialog, FormItem, Input, Notification, toast } from '@/components/ui'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ISiswa } from '@/@types/kursus.types'

interface PasswordAplikasiDialogProps {
    open: boolean
    siswa: ISiswa
    onClose: () => void
    onSuccess: () => void
}

/** Atur/reset password login aplikasi siswa. Username login = nomor telepon siswa. */
const PasswordAplikasiDialog = ({ open, siswa, onClose, onSuccess }: PasswordAplikasiDialogProps) => {
    const [password, setPassword] = useState('')
    const [konfirmasi, setKonfirmasi] = useState('')
    const [error, setError] = useState<{ password?: string; konfirmasi?: string }>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        setPassword('')
        setKonfirmasi('')
        setError({})
    }, [open])

    const sudahAktif = siswa.punya_akun_aplikasi === 1
    const tanpaTelepon = !siswa.telepon?.trim()

    const simpan = async () => {
        const e: { password?: string; konfirmasi?: string } = {}
        if (password.length < 6) e.password = 'Minimal 6 karakter'
        if (konfirmasi !== password) e.konfirmasi = 'Password tidak sama'
        setError(e)
        if (Object.keys(e).length) return

        setSubmitting(true)
        try {
            await SiswaService.setPasswordAplikasi(siswa.id_siswa, password)
            toast.push(<Notification type="success" title="Password aplikasi siswa berhasil diatur" />)
            onSuccess()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal mengatur password aplikasi">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={open} onClose={submitting ? undefined : onClose} closable={!submitting} width={440}>
            <h5 className="mb-1">{sudahAktif ? 'Reset Password Aplikasi' : 'Atur Password Aplikasi'}</h5>
            <p className="text-sm text-gray-500 mb-5">
                Siswa login ke aplikasi dengan nomor telepon{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{siswa.telepon || '-'}</span>{' '}
                dan password ini. Sampaikan password langsung ke siswa/wali.
            </p>

            {tanpaTelepon ? (
                <p className="text-sm text-red-500 mb-4">
                    Siswa ini belum punya nomor telepon. Isi nomor telepon di Edit siswa dulu.
                </p>
            ) : (
                <div className="flex flex-col gap-1">
                    <FormItem label="Password Baru" asterisk invalid={!!error.password} errorMessage={error.password}>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            invalid={!!error.password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormItem>
                    <FormItem label="Ulangi Password" asterisk invalid={!!error.konfirmasi} errorMessage={error.konfirmasi}>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Ketik ulang password"
                            value={konfirmasi}
                            invalid={!!error.konfirmasi}
                            onChange={(e) => setKonfirmasi(e.target.value)}
                        />
                    </FormItem>
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} disabled={tanpaTelepon} onClick={simpan}>
                    Simpan Password
                </Button>
            </div>
        </Dialog>
    )
}

export default PasswordAplikasiDialog
