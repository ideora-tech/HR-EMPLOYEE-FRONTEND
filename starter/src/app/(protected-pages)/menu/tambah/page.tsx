'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Notification, toast } from '@/components/ui'
import MenuFormPage from '@/components/menu/MenuFormPage'
import MenuService from '@/services/menu.service'
import ModulService from '@/services/modul.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IMenu, IMenuCreate, IMenuUpdate } from '@/@types/menu.types'

const TambahMenuPage = () => {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [menuList, setMenuList] = useState<IMenu[]>([])

    useEffect(() => {
        Promise.all([
            MenuService.getAll({ limit: 200 }),
            ModulService.getAll({ aktif: 1, limit: 100 }),
        ]).then(([menuRes]) => {
            if (menuRes.success) setMenuList(menuRes.data)
        }).catch(() => { })
    }, [])

    const handleSubmit = async (payload: IMenuCreate | IMenuUpdate) => {
        setSubmitting(true)
        try {
            await MenuService.create(payload as IMenuCreate)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.MENU)} />,
            )
            router.push('/menu')
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.MENU)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <MenuFormPage
            menuList={menuList}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/menu')}
        />
    )
}

export default TambahMenuPage
