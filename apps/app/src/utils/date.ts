import dayjs from 'dayjs'

export const formatDate = (date: string | null) => {
  if (!date) return null
  return dayjs(date).format('D MMM')
}
