import { AuthCard } from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your new password below to reset your account password."
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}
