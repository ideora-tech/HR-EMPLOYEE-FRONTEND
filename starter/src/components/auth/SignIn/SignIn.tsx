'use client'

import Alert from '@/components/ui/Alert'
import SignInForm from './SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import type { OnSignIn } from './SignInForm'

type SignInProps = {
    forgetPasswordUrl?: string
    onSignIn?: OnSignIn
}

const SignIn = ({
    forgetPasswordUrl = '/forgot-password',
    onSignIn,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <>
            <div className="mb-8">
                <img
                    src="/logo-sky.jpeg"
                    alt="SKY Dance Academy"
                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }}
                />
            </div>
            <div className="mb-8">
                <h2 className="mb-1" style={{ fontSize: '26px', color: '#18102E' }}>
                    Selamat Datang!
                </h2>
                <p style={{ color: '#6A6484', fontSize: '14px' }}>
                    Masuk ke akun Sky Dance Anda
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                setMessage={setMessage}
                passwordHint={
                    <div className="mb-7 mt-2 flex justify-end">
                        <ActionLink
                            href={forgetPasswordUrl}
                            className="font-semibold mt-2"
                            themeColor={true}
                        >
                            Lupa Password?
                        </ActionLink>
                    </div>
                }
                onSignIn={onSignIn}
            />
        </>
    )
}

export default SignIn
