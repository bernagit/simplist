import CalendarPage from '@/components/calendar/CalendarPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View and manage your calendar tasks.'
}

export default function Page() {
  return <CalendarPage />
}
