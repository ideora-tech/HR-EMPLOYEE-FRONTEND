import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL!

type Params = { params: Promise<{ path: string[] }> }

async function handler(request: NextRequest, { params }: Params) {
    const session = await auth()
    const { path } = await params

    const backendPath = '/' + path.join('/')
    const search = request.nextUrl.search
    const backendUrl = `${BACKEND_URL}${backendPath}${search}`

    const contentTypeReq = request.headers.get('content-type') ?? ''
    const isMultipart = contentTypeReq.includes('multipart/form-data')

    const headers: Record<string, string> = {
        Accept: 'application/json',
    }

    // For regular requests with body, set Content-Type explicitly.
    // For multipart, let fetch set it automatically (with boundary).
    if (
        request.method !== 'GET' &&
        request.method !== 'HEAD' &&
        !isMultipart
    ) {
        headers['Content-Type'] = 'application/json'
    }

    if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`
    }

    let body: BodyInit | undefined
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        if (isMultipart) {
            // Forward raw FormData so the backend receives the file correctly
            body = await request.formData()
        } else {
            body = await request.text()
        }
    }

    const response = await fetch(backendUrl, {
        method: request.method,
        headers,
        body,
    })

    const contentType = response.headers.get('content-type') ?? ''

    // Pass-through binary responses (Excel, PDF, etc.) directly
    if (!contentType.includes('application/json')) {
        const buffer = await response.arrayBuffer()
        const resHeaders = new Headers()
        resHeaders.set('Content-Type', contentType)
        const disposition = response.headers.get('content-disposition')
        if (disposition) resHeaders.set('Content-Disposition', disposition)
        return new NextResponse(buffer, {
            status: response.status,
            headers: resHeaders,
        })
    }

    const text = await response.text()
    let data: unknown
    try {
        data = JSON.parse(text)
    } catch {
        data = text
    }

    return NextResponse.json(data, { status: response.status })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
