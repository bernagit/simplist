import { Resp } from '@/models/base'
import { Invite, InviteCheckResponse, InviteCreated, RevokedInvite } from '@/models/invite'
import api from '@/utils/ky'

async function checkInvite(token: string): Promise<Resp<InviteCheckResponse>> {
  return await api.get<Resp<InviteCheckResponse>>(`invites/${token}/check`).json()
}

async function createInvite(email: string | null): Promise<Resp<InviteCreated>> {
  const body = email ? { email } : {}
  return await api.post<Resp<InviteCreated>>('invites', { json: body }).json()
}

async function getInvites(): Promise<Resp<Invite[]>> {
  return await api.get<Resp<Invite[]>>('invites').json()
}

async function revokeInvite(inviteId: string): Promise<Resp<RevokedInvite>> {
  return await api.patch<Resp<RevokedInvite>>(`invites/${inviteId}/revoke`).json()
}

export const inviteService = {
  checkInvite,
  createInvite,
  getInvites,
  revokeInvite
}
