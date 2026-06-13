import classNames from 'classnames'
import Image from 'next/image'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number
    logoHeight?: number
}

const Logo = (props: LogoProps) => {
    const { type = 'full', className, style } = props

    return (
        <div className={classNames('logo flex items-center gap-2', className)} style={style}>
            <Image
                src="/logo-sky.jpeg"
                alt="SKY Dance Academy"
                width={36}
                height={36}
                priority
                style={{ borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            {type === 'full' && (
                <span style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '15px',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                }}>
                    SKY Dance
                </span>
            )}
        </div>
    )
}

export default Logo
