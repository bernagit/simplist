import { Resp } from '@/models/base'
import {
  DeliveryReport,
  DeviceInput,
  NotificationConfig,
  NotificationDevice,
  NotificationSettings
} from '@/models/notification'
import api from '@/utils/ky'

async function getConfig(): Promise<Resp<NotificationConfig>> {
  return await api.get('notifications/config').json()
}

async function getSettings(): Promise<Resp<NotificationSettings>> {
  return await api.get('notifications/settings').json()
}

async function updateSettings(
  input: Partial<NotificationSettings>
): Promise<Resp<NotificationSettings>> {
  return await api.put('notifications/settings', { json: input }).json()
}

async function getDevices(): Promise<Resp<NotificationDevice[]>> {
  return await api.get('notifications/devices').json()
}

async function registerDevice(input: DeviceInput): Promise<Resp<{ id: string }>> {
  return await api.post('notifications/devices', { json: input }).json()
}

async function unregisterDevice(endpoint: string): Promise<null> {
  return await api.post('notifications/devices/unsubscribe', { json: { endpoint } }).json()
}

async function removeDevice(id: string): Promise<null> {
  return await api.delete(`notifications/devices/${id}`).json()
}

async function sendTest(input: { title: string; body: string }): Promise<Resp<DeliveryReport>> {
  return await api.post('notifications/test', { json: input }).json()
}

export const notificationsService = {
  getConfig,
  getSettings,
  updateSettings,
  getDevices,
  registerDevice,
  unregisterDevice,
  removeDevice,
  sendTest
}
