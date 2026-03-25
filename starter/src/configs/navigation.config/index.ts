import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'organisasi',
        path: '',
        title: 'Struktur Organisasi',
        translateKey: 'nav.organisasi',
        icon: 'organisasi',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'organisasi.struktur',
                path: '/struktur-organisasi',
                title: 'Bagan Organisasi',
                translateKey: 'nav.organisasi.struktur',
                icon: 'struktur-organisasi',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'organisasi.departemen',
                path: '/departemen',
                title: 'Departemen',
                translateKey: 'nav.organisasi.departemen',
                icon: 'departemen',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'organisasi.jabatan',
                path: '/jabatan',
                title: 'Jabatan',
                translateKey: 'nav.organisasi.jabatan',
                icon: 'jabatan',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'organisasi.lokasiKantor',
                path: '/lokasi-kantor',
                title: 'Lokasi Kantor',
                translateKey: 'nav.organisasi.lokasiKantor',
                icon: 'lokasi-kantor',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
