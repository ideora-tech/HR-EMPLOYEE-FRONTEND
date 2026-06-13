import { cloneElement } from 'react'
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
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: '22px' }}>💼</span>
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px', lineHeight: 1.2 }}>IdeoraHR</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>by Ideora Tech</div>
                        </div>
                    </div>

                    <h2 style={{
                        color: '#fff', fontSize: '32px', fontWeight: 800,
                        lineHeight: 1.2, marginBottom: '16px',
                        textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                    }}>
                        Kelola SDM &<br />Penggajian dengan<br />
                        <span style={{ color: '#D4B8FF' }}>Lebih Mudah</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
                        Platform HR & Payroll modern untuk bisnis Indonesia — cepat, akurat, dan aman.
                    </p>

                    {/* Feature list */}
                    {[
                        { icon: '✓', text: 'Penggajian otomatis dengan PPh 21 & BPJS' },
                        { icon: '✓', text: 'Manajemen karyawan & struktur organisasi' },
                        { icon: '✓', text: 'Absensi digital & laporan real-time' },
                        { icon: '✓', text: 'Multi-perusahaan dalam satu platform' },
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
                        <span style={{ fontSize: '28px' }}>💼</span>
                        <span style={{ fontWeight: 800, fontSize: '20px', color: '#5533BB' }}>IdeoraHR</span>
                    </div>

                    <div
                        className="rounded-2xl p-8 shadow-sm"
                        style={{ background: '#fff', border: '1px solid rgba(85,51,187,0.1)' }}
                    >
                        {children
                            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              cloneElement(children as React.ReactElement<any>, { ...rest })
                            : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Side
