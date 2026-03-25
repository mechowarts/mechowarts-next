import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const inputVariants = cva('', {
  variants: {
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
      lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>

function Input({ className, size = 'default', type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1.5 text-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        inputVariants({ size }),
        className
      )}
      {...props}
    />
  )
}

export { Input }
