import { getUserByRoll } from '@/api/http/users'
import { RollInput } from '@/features/auth/roll-input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function AuthenticationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <h2 className="text-foreground mb-2 text-center text-2xl font-bold">
        Welcome to MechoWarts
      </h2>
      <p className="text-muted-foreground mb-6 text-center">
        Please enter your roll number to continue.
      </p>

      <RollInput
        isLoading={isLoading}
        onSubmit={async (roll) => {
          setIsLoading(true)

          try {
            const user = await getUserByRoll(roll)

            router.push(
              user?.name
                ? `/authentication/login/${roll}`
                : `/authentication/verify-email/${roll}`
            )
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : 'An error occurred. Please try again.'
            )
          } finally {
            setIsLoading(false)
          }
        }}
      />
    </>
  )
}
