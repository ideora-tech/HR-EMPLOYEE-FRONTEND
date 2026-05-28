import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IReminderItem } from '@/@types/kursus.types'

interface ReminderResponse {
  message: string
  data: IReminderItem[]
}

interface ReminderItemResponse {
  message: string
  data: IReminderItem
}

const ReminderService = {
  async getReminders(threshold = 3): Promise<IReminderItem[]> {
    const res = await ApiService.fetchDataWithAxios<ReminderResponse>({
      url: `${API_ENDPOINTS.KURSUS.REMINDER.BASE}?threshold=${threshold}`,
      method: 'GET',
    })
    return res.data
  },

  async tandaiDihubungi(idCatat: string): Promise<IReminderItem> {
    const res = await ApiService.fetchDataWithAxios<ReminderItemResponse>({
      url: API_ENDPOINTS.KURSUS.REMINDER.TANDAI(idCatat),
      method: 'PATCH',
    })
    return res.data
  },
}

export default ReminderService
