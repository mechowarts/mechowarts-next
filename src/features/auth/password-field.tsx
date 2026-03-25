import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface PasswordFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  'type'
> {
  label?: string
}

export function PasswordField({
  className,
  id,
  label,
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <Label htmlFor={id} className="mb-1">
          {label}
        </Label>
      ) : null}

      <div className="relative">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={cn('pr-11', className)}
          {...props}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setIsVisible((current) => !current)}
          disabled={props.disabled}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      </div>
    </div>
  )
}
