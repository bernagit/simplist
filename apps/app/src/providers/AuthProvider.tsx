'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/models/user'
import { authService } from '@/services/auth'

type AuthContextValue = {
  user: User | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  hasSessionCookie
}: {
  children: ReactNode
  hasSessionCookie: boolean
}) {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: hasSessionCookie,
    retry: false,
    staleTime: 1000 * 60 * 5
  })

  const user = isError ? undefined : data?.data
  const isAuthenticated = Boolean(user)

  async function login(email: string, password: string) {
    await authService.login(email, password)
    await refetch()
  }

  async function logout() {
    await authService.logout()
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, refetchUser: refetch }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}