export default function WaveDivider() {
    return (
        <div aria-hidden className="relative h-12 sm:h-16">
            <svg
                viewBox="0 0 1440 80"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
            >
                <path
                    d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,32 L1440,80 L0,80 Z"
                    fill="var(--sky-bg)"
                />
            </svg>
        </div>
    )
}
