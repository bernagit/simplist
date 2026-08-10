'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage')

  return (
    <AuthCard
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}