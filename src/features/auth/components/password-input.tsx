import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, type ComponentProps } from 'react'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>

export function PasswordInput({ ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative isolate">
      <Input {...props} type={isVisible ? 'text' : 'password'} />

      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsVisible((prev) => !prev)}
        className="absolute top-1/2 right-1.5 aspect-square h-[75%] w-auto -translate-y-1/2 p-1.5!"
      >
        {isVisible ? (
          <HugeiconsIcon icon={ViewIcon} className="size-full" />
        ) : (
          <HugeiconsIcon icon={ViewOffIcon} className="size-full" />
        )}
      </Button>
    </div>
  )
}
