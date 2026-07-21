export type InviteCreated = {
  inviteUrl: string
  token: string
}

export type Invite = {
  id: string
  email: string | null
  used: boolean
  expiresAt: string
  createdAt: string
}

export type RevokedInvite = {
  id: string
  email: string | null
  revoked: boolean
}

export type InviteCheckResponse = {
  email: string | null
}
