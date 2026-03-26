import { ForgetPasswordConfirmForm } from '@/features/auth/components/forget-password-confirm-form'
import {
  ForgetPasswordRequestForm,
  type ForgotPasswordFlowData,
} from '@/features/auth/components/forget-password-request-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ForgotPasswordFlowData | null>(() => {
    const roll = searchParams.get('roll')

    return roll ? { roll, tokens: [] } : null
  })

  return (
    <div className="space-y-6">
      {data && data.tokens.length > 0 ? (
        <ForgetPasswordConfirmForm
          data={data}
          onBack={() => {
            setData(null)
            router.replace('/forgot-password')
          }}
        />
      ) : (
        <ForgetPasswordRequestForm
          defaultRoll={data?.roll ?? searchParams.get('roll') ?? ''}
          onSubmit={setData}
        />
      )}
    </div>
  )
}
