'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { useTranslations } from 'next-intl'

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPasswordPage')

  return (
    <AuthCard
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}