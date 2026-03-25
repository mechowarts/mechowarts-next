import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <img
        src="/assets/images/logo-full.png"
        alt="MechoWarts Logo"
        className="block h-full w-full object-cover object-center"
      />
    </div>
  )
}
