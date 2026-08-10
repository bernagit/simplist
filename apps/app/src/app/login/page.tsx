'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('LoginPage')

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <LoginForm />
    </AuthCard>
  )
}