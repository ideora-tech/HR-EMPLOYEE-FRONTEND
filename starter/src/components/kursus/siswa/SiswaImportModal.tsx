'use client'

import { useState } from 'react'
import { Button, Dialog, Upload, Notification, toast } from '@/components/ui'
import { HiOutlineUpload, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IImportResult } from '@/@types/kursus.types'

interface SiswaImportModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const SiswaImportModal = ({ open, onClose, onSuccess }: SiswaImportModalProps) => {
    const [fileList, setFileList] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<IImportResult | null>(null)

    const handleClose = () => {
        if (uploading) return
        setFileList([])
        setResult(null)
        onClose()
    }

    const handleUpload = async () => {
        if (fileList.length === 0) return
        setUploading(true)
        setResult(null)
        try {
            const res = await SiswaService.importExcel(fileList[0])
            if (res.success) {
                setResult(res.data)
                toast.push(
                    <Notification type="success" title={`${res.data.berhasil} siswa berhasil diimport`} />,
                )
                onSuccess()
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal mengimport data">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setUploading(false)
        }
    }

    const beforeUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return false
        const file = files[0]
        const isXlsx =
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.name.endsWith('.xlsx')
        if (!isXlsx) {
            toast.push(<Notification type="warning" title="Hanya file .xlsx yang diizinkan" />)
            return false
        }
        return true
    }

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            closable={!uploading}
            width={480}
        >
            <h5 className="mb-5">Import Siswa dari Excel</h5>

            {!result ? (
                <>
                    <Upload
                        draggable
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        uploadLimit={1}
                        fileList={fileList}
                        beforeUpload={beforeUpload}
                        onChange={(files) => setFileList(files)}
                        onFileRemove={() => setFileList([])}
                        tip={
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                                Seret & lepas file <span className="font-semibold">.xlsx</span> ke sini,
                                atau klik untuk memilih file
                            </p>
                        }
                    >
                        <div className="flex flex-col items-center gap-2 py-6">
                            <HiOutlineUpload className="text-4xl text-gray-300 dark:text-gray-600" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Upload File Excel
                            </p>
                        </div>
                    </Upload>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="plain" onClick={handleClose} disabled={uploading}>
                            Batal
                        </Button>
                        <Button
                            variant="solid"
                            icon={<HiOutlineUpload />}
                            loading={uploading}
                            disabled={fileList.length === 0}
                            onClick={handleUpload}
                        >
                            Import
                        </Button>
                    </div>
                </>
            ) : (
                /* ── Hasil import ── */
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                        <HiOutlineCheckCircle className="text-2xl text-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                {result.berhasil} siswa berhasil diimport
                            </p>
                            {result.gagal > 0 && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {result.gagal} baris gagal diimport
                                </p>
                            )}
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlineExclamationCircle className="text-lg text-red-500 flex-shrink-0" />
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    {result.errors.length} baris error
                                </p>
                            </div>
                            <ul className="text-xs text-red-500 dark:text-red-400 space-y-1 max-h-36 overflow-y-auto">
                                {result.errors.map((e, i) => (
                                    <li key={i} className="flex gap-1.5">
                                        <span className="shrink-0">•</span>
                                        <span>{e}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => { setFileList([]); setResult(null) }}
                        >
                            Import Lagi
                        </Button>
                        <Button variant="solid" onClick={handleClose}>
                            Selesai
                        </Button>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

export default SiswaImportModal
