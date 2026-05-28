'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, toast, Notification } from '@/components/ui'
import { IReminderItem } from '@/@types/kursus.types'
import ReminderService from '@/services/kursus/reminder.service'
import { parseApiError } from '@/utils/parseApiError'
import CreateTagihanFromReminderDrawer from './CreateTagihanFromReminderDrawer'

const THRESHOLD_OPTIONS = [1, 2, 3, 5]

function SesiLabel({ sesi }: { sesi: number }) {
  if (sesi === 0)
    return (
      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-400">
        {sesi} sesi
      </span>
    )
  if (sesi <= 2)
    return (
      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
        {sesi} sesi
      </span>
    )
  return (
    <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
      {sesi} sesi
    </span>
  )
}

export default function ReminderTable() {
  const [items, setItems] = useState<IReminderItem[]>([])
  const [threshold, setThreshold] = useState(3)
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IReminderItem | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ReminderService.getReminders(threshold)
      setItems(data)
    } catch (err) {
      toast.push(
        <Notification type="danger" title="Gagal memuat data">
          {parseApiError(err)}
        </Notification>,
      )
    } finally {
      setLoading(false)
    }
  }, [threshold])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTandai = async (idCatat: string) => {
    try {
      const updated = await ReminderService.tandaiDihubungi(idCatat)
      setItems((prev) =>
        prev.map((item) => (item.id_catat === idCatat ? updated : item)),
      )
      toast.push(
        <Notification type="success" title="Berhasil">
          Siswa ditandai sudah dihubungi
        </Notification>,
      )
    } catch (err) {
      toast.push(
        <Notification type="danger" title="Gagal">
          {parseApiError(err)}
        </Notification>,
      )
    }
  }

  const handleOpenDrawer = (item: IReminderItem) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedItem(null)
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Tampilkan siswa dengan sisa sesi ≤
        </span>
        <select
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        >
          {THRESHOLD_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt} sesi
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500">{items.length} siswa</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Nama Siswa</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Kelas</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Sisa Sesi</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    Tidak ada siswa dengan sisa sesi ≤ {threshold}
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id_catat} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.nama_siswa}</div>
                      {item.telepon && <div className="text-xs text-gray-400">{item.telepon}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.nama_kelas}</td>
                    <td className="px-4 py-3"><SesiLabel sesi={item.sesi_tersisa} /></td>
                    <td className="px-4 py-3">
                      {item.status_reminder === 1 ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">Sudah Dihubungi</span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">Belum Dihubungi</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.status_reminder === 0 && (
                          <Button size="xs" variant="solid" color="green" onClick={() => handleTandai(item.id_catat)}>
                            Sudah Dihubungi
                          </Button>
                        )}
                        <Button size="xs" variant="solid" onClick={() => handleOpenDrawer(item)}>
                          Generate Tagihan
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <CreateTagihanFromReminderDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          idSiswa={selectedItem.id_siswa}
          namaSiswa={selectedItem.nama_siswa}
          onSuccess={() => {
            handleCloseDrawer()
            fetchData()
          }}
        />
      )}
    </div>
  )
}
