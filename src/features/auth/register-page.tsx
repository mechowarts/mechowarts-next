import { RegisterConfirmForm } from '@/features/auth/components/register-confirm-form'
import {
  RegisterRequestForm,
  type RegisterFlowData,
} from '@/features/auth/components/register-request-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<RegisterFlowData | null>(() => {
    const roll = searchParams.get('roll')

    return roll
      ? {
          confirmPassword: '',
          gender: 'male',
          location: '',
          name: '',
          password: '',
          roll,
          tokens: [],
          visibility: 'public',
        }
      : null
  })

  return (
    <div className="space-y-6">
      {data && data.tokens.length > 0 ? (
        <RegisterConfirmForm
          data={data}
          onBack={() => {
            setData(null)
            router.replace('/register')
          }}
        />
      ) : (
        <RegisterRequestForm
          defaultValues={data ?? undefined}
          onSubmit={setData}
        />
      )}
    </div>
  )
}
