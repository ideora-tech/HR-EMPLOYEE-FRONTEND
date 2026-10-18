import PeranIzinPage from '@/components/peran/PeranIzinPage'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    return <PeranIzinPage idPeran={id} />
}

export default Page
