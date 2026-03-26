import { cn } from '@/lib/utils'
import { type ComponentPropsWithoutRef } from 'react'
import { LuLoader } from 'react-icons/lu'

type SpinnerProps = ComponentPropsWithoutRef<'svg'>

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <LuLoader
      width="1em"
      height="1em"
      className={cn('shrink-0 animate-spin', className)}
      {...props}
    />
  )
}
