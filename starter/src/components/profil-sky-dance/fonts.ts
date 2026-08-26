import { Baloo_2, Plus_Jakarta_Sans } from 'next/font/google'

export const displayFont = Baloo_2({
    subsets: ['latin'],
    weight: ['600', '700', '800'],
    variable: '--sky-font-display',
})

export const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--sky-font-body',
})
