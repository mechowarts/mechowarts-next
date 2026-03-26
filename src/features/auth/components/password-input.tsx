import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, type ComponentProps } from 'react'

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  'type' | 'autoComplete'
>

export function PasswordInput({ ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative isolate">
      <Input
        {...props}
        type={isVisible ? 'text' : 'password'}
        autoComplete="new-password"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible((prev) => !prev)}
      >
        {isVisible ? 'Hide' : 'Show'}
      </Button>
    </div>
  )
}
