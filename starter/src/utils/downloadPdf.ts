import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

/**
 * Generate PDF from a @react-pdf/renderer Document element and trigger download.
 * Uses dynamic import so the heavy PDF library is only loaded when needed.
 */
export async function downloadPdf(element: ReactElement, filename: string): Promise<void> {
    const { pdf } = await import('@react-pdf/renderer')
    const blob = await pdf(element as ReactElement<DocumentProps>).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
