import { LoginStartForm } from '@/features/auth/components/login-start-form'
import { LoginWithPasswordForm } from '@/features/auth/components/login-with-password-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedRoll, setSelectedRoll] = useState(() =>
    searchParams.get('roll')
  )

  return (
    <div className="space-y-6">
      {selectedRoll ? (
        <LoginWithPasswordForm
          roll={selectedRoll}
          backToStart={() => {
            setSelectedRoll('')
            router.replace('/login')
          }}
        />
      ) : (
        <LoginStartForm
          onSubmit={(data) => {
            setSelectedRoll(data.roll)
            router.replace(`/login?roll=${data.roll}`)
          }}
        />
      )}
    </div>
  )
}
