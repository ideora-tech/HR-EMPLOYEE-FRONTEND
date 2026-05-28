'use client'

import { Card } from '@/components/ui'
import ReminderTable from '@/components/kursus/reminder/ReminderTable'

export default function ReminderPage() {
    return (
        <Card
            header={{
                content: <h4>Reminder Perpanjangan Kursus</h4>,
                extra: (
                    <p className="text-sm text-gray-500">
                        Siswa yang sesinya hampir habis — hubungi untuk perpanjangan
                    </p>
                ),
                bordered: false,
            }}
            bodyClass="p-0"
        >
            <ReminderTable />
        </Card>
    )
}
