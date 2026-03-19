import type { InternalAxiosRequestConfig } from 'axios'

// Token tidak perlu di-set di sini — semua request lewat /api/proxy/* Route Handler
// yang membaca token langsung dari sesi server-side (auth()).
const AxiosRequestIntrceptorConfigCallback = (
    config: InternalAxiosRequestConfig,
) => {
    return config
}

export default AxiosRequestIntrceptorConfigCallback
