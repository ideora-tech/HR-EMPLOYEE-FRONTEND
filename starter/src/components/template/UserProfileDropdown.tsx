'use client'

import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Link from 'next/link'
import signOut from '@/server/actions/auth/handleSignOut'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { PiUserDuotone, PiSignOutDuotone } from 'react-icons/pi'

import type { JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const ROLE_LABELS: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    OWNER: 'Owner',
    HR_ADMIN: 'HR Admin',
    FINANCE: 'Finance',
    EMPLOYEE: 'Karyawan',
    COACH: 'Coach',
}

const formatRole = (role?: string | null) => {
    if (!role) return ''
    return (
        ROLE_LABELS[role] ??
        role
            .split('_')
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
            .join(' ')
    )
}

const _UserDropdown = () => {
    const { session } = useCurrentSession()

    const handleSignOut = async () => {
        await signOut()
    }

    const avatarProps = {
        ...(session?.user?.image
            ? { src: session?.user?.image }
            : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end justify-center leading-tight">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                            {session?.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatRole(session?.user?.role)}
                        </span>
                    </div>
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {session?.user?.name || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {session?.user?.email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" href={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
