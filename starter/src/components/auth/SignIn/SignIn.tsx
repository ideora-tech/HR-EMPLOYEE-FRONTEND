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
                <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #5533BB, #9830C0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', marginBottom: '4px',
                }}>
                    💼
                </div>
            </div>
            <div className="mb-8">
                <h2 className="mb-1" style={{ fontSize: '26px', color: '#18102E' }}>
                    Selamat Datang!
                </h2>
                <p style={{ color: '#6A6484', fontSize: '14px' }}>
                    Masuk ke akun IdeoraHR Anda
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
