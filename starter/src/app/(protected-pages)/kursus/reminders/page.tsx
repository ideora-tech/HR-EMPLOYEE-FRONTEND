import ReminderTable from '@/components/kursus/reminder/ReminderTable'

export default function ReminderPage() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Reminder Perpanjangan Kursus
                </h4>
                <p className="text-sm text-gray-500">
                    Siswa yang sesinya hampir habis — hubungi untuk perpanjangan
                </p>
            </div>
            <ReminderTable />
        </div>
    )
}
