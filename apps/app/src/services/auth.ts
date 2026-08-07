import { User } from '@/models/user'
import { Resp } from '@/models/base'
import api from '@/utils/ky'

async function login(email: string, password: string): Promise<{ token: string }> {
  return await api.post<{ token: string }>('auth/login', { json: { email, password } }).json()
}

async function register(
  name: string,
  email: string,
  password: string,
  token: string
): Promise<{ token: string }> {
  return await api
    .post<{
      token: string
    }>('auth/register', { json: { name, email, password, inviteToken: token } })
    .json()
}

async function logout(): Promise<void> {
  await api.post('auth/logout').json()
}

async function getMe(): Promise<Resp<User>> {
  const res = await api.get<Resp<User>>('auth/me').json()
  return res
}

async function updateCurrentUser(data: { name?: string; email?: string, avatar?: string | null }): Promise<Resp<User>> {
  const res = await api.put<Resp<User>>('auth/me', { json: data }).json()
  return res
}

async function forgotPassword(email: string): Promise<void> {
  await api.post('auth/forgot-password', { json: { email } }).json()
}

async function resetPassword(email: string, token: string, newPassword: string): Promise<void> {
  await api.post('auth/reset-password', { json: { email, token, newPassword } }).json()
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('auth/change-password', { json: { currentPassword, newPassword } }).json()
}

export const authService = {
  login,
  register,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateCurrentUser,
  changePassword
}
