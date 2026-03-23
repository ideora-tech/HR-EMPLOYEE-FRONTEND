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

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }

    if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`
    }

    const body =
        request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.text()
            : undefined

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
