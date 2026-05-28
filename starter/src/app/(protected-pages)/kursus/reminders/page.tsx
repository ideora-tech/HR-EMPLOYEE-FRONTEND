import ReminderTable from '@/components/kursus/reminder/ReminderTable'

export default function ReminderPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Reminder Perpanjangan Kursus
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Daftar siswa yang sesinya hampir habis. Hubungi siswa/wali untuk
                    perpanjangan, lalu generate tagihan baru.
                </p>
            </div>
            <ReminderTable />
        </div>
    )
}
