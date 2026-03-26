'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Select, Notification, toast } from '@/components/ui'
import { HiOutlineRefresh } from 'react-icons/hi'
import OrgChart from '@/components/organisasi/OrgChart'
import OrganisasiService from '@/services/organisasi.service'
import PerusahaanService from '@/services/perusahaan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES } from '@/constants/message.constant'
import type { IOrgChartStruktur } from '@/@types/organisasi.types'
import type { IPerusahaan } from '@/@types/perusahaan.types'

type PerusahaanOption = { value: string; label: string }

const ENTITY_STRUKTUR = 'Struktur Organisasi'

const StrukturOrganisasiPage = () => {
    const [data, setData] = useState<IOrgChartStruktur | null>(null)
    const [loading, setLoading] = useState(false)

    const [perusahaanList, setPerusahaanList] = useState<IPerusahaan[]>([])
    const [perusahaanOptions, setPerusahaanOptions] = useState<PerusahaanOption[]>([
        { value: '', label: 'Semua Perusahaan' },
    ])
    const [selectedPerusahaan, setSelectedPerusahaan] = useState('')

    // Load perusahaan list for filter
    useEffect(() => {
        PerusahaanService.getAll({ aktif: 1, limit: 100 })
            .then((res) => {
                if (res.success) {
                    setPerusahaanList(res.data)
                    setPerusahaanOptions([
                        { value: '', label: 'Semua Perusahaan' },
                        ...res.data.map((p) => ({
                            value: p.id_perusahaan,
                            label: p.nama_perusahaan,
                        })),
                    ])
                }
            })
            .catch(() => {/* ignore */ })
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await OrganisasiService.getStruktur(
                selectedPerusahaan || undefined,
            )
            if (res.success) {
                setData(res.data)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY_STRUKTUR)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [selectedPerusahaan])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Struktur Organisasi</h4>,
                    extra: (
                        <div className="flex items-center gap-3">
                            {perusahaanList.length > 0 && (
                                <Select<PerusahaanOption>
                                    className="w-56"
                                    options={perusahaanOptions}
                                    value={
                                        perusahaanOptions.find(
                                            (o) => o.value === selectedPerusahaan,
                                        ) ?? perusahaanOptions[0]
                                    }
                                    onChange={(opt) =>
                                        setSelectedPerusahaan(
                                            (opt as PerusahaanOption).value,
                                        )
                                    }
                                />
                            )}
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineRefresh />}
                                loading={loading}
                                onClick={fetchData}
                            >
                                Refresh
                            </Button>
                        </div>
                    ),
                    bordered: false,
                }}
            >
                <OrgChart data={data} loading={loading} />
            </Card>
        </div>
    )
}

export default StrukturOrganisasiPage
