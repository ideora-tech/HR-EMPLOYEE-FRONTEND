import { cloneElement } from 'react'
import type { ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full">
            {/* ── Panel Kiri — Gradient Purple ── */}
            <div
                className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden flex-shrink-0"
                style={{
                    width: '480px',
                    background: 'linear-gradient(160deg, #180870 0%, #4422A8 45%, #9830C0 100%)',
                }}
            >
                {/* Dekorasi lingkaran */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '320px', height: '320px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '-60px',
                    width: '280px', height: '280px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                }} />
                <div style={{
                    position: 'absolute', top: '40%', left: '-40px',
                    width: '160px', height: '160px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                }} />

                {/* Logo & Brand */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <img
                            src="/logo-sky.jpeg"
                            alt="SKY Dance Academy"
                            style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover' }}
                        />
                        <div>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px', lineHeight: 1.2 }}>SKY Dance Academy</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Powered by IdeoraHR</div>
                        </div>
                    </div>

                    <h2 style={{
                        color: '#fff', fontSize: '32px', fontWeight: 800,
                        lineHeight: 1.2, marginBottom: '16px',
                        textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                    }}>
                        Selamat Datang di<br />
                        <span style={{ color: '#D4B8FF' }}>SKY Dance Academy</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
                        Kelola karyawan, jadwal, dan penggajian academy Anda dengan mudah dan efisien.
                    </p>

                    {/* Feature list */}
                    {[
                        { icon: '✓', text: 'Manajemen karyawan & instruktur' },
                        { icon: '✓', text: 'Jadwal kelas & absensi digital' },
                        { icon: '✓', text: 'Penggajian otomatis & slip gaji' },
                        { icon: '✓', text: 'Laporan keuangan real-time' },
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <span style={{ color: '#C8A8FF', fontSize: '13px', fontWeight: 700 }}>{f.icon}</span>
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>{f.text}</span>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                        © 2025 Ideora Tech. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </div>

            {/* ── Panel Kanan — Form ── */}
            <div
                className="flex flex-col justify-center items-center flex-1 p-8"
                style={{ background: '#F3F0FC' }}
            >
                <div className="w-full max-w-[420px]">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <img src="/logo-sky.jpeg" alt="SKY Dance Academy" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 800, fontSize: '20px', color: '#5533BB' }}>SKY Dance Academy</span>
                    </div>

                    <div
                        className="rounded-2xl p-8 shadow-sm"
                        style={{ background: '#fff', border: '1px solid rgba(85,51,187,0.1)' }}
                    >
                        {children
                            ? cloneElement(children as ReactElement<Record<string, unknown>>, { ...rest })
                            : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Side
