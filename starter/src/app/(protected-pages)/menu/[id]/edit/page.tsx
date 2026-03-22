'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import MenuFormPage from '@/components/menu/MenuFormPage'
import MenuService from '@/services/menu.service'
import ModulService from '@/services/modul.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IMenu, IMenuUpdate } from '@/@types/menu.types'
import type { IModul } from '@/@types/modul.types'

const EditMenuPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IMenu | null>(null)
    const [menuList, setMenuList] = useState<IMenu[]>([])
    const [modulList, setModulList] = useState<IModul[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        Promise.all([
            MenuService.getById(id),
            MenuService.getAll({ limit: 200 }),
            ModulService.getAll({ aktif: 1, limit: 100 }),
        ])
            .then(([detailRes, listRes, modulRes]) => {
                if (detailRes.success) setEditData(detailRes.data)
                if (listRes.success) setMenuList(listRes.data)
                if (modulRes.success) setModulList(modulRes.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data menu">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push('/menu')
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (payload: IMenuUpdate) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await MenuService.update(editData.id_menu, payload)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.MENU)} />,
            )
            router.push('/menu')
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.UPDATE(ENTITY.MENU)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Spinner size={36} />
            </div>
        )
    }

    if (!editData) return null

    return (
        <MenuFormPage
            editData={editData}
            menuList={menuList}
            modulList={modulList}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/menu')}
        />
    )
}

export default EditMenuPage
