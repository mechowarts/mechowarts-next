import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ProgressiveAuthStep = 'login' | 'register' | 'roll'

interface AuthStepperProps {
  currentStepIndex: number
  goToStep: (index: number) => void
  stepHistory: ProgressiveAuthStep[]
}

const stepLabels: Record<ProgressiveAuthStep, string> = {
  login: 'Sign in',
  register: 'Register',
  roll: 'Roll number',
}

export function AuthStepper({
  currentStepIndex,
  goToStep,
  stepHistory,
}: AuthStepperProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stepHistory.map((step, index) => {
        const isActive = index === currentStepIndex
        const isCompleted = index < currentStepIndex

        return (
          <Button
            key={`${step}-${index}`}
            type="button"
            variant="ghost"
            disabled={!isCompleted}
            onClick={() => goToStep(index)}
            className={cn(
              'h-auto min-h-20 justify-start rounded-3xl border px-4 py-4 text-left transition-all',
              isActive &&
                'border-slate-900 bg-slate-950 text-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.9)] hover:bg-slate-900',
              isCompleted &&
                'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
              !isActive &&
                !isCompleted &&
                'cursor-default border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-50'
            )}
          >
            <div className="space-y-1">
              <div className="text-xs font-semibold tracking-[0.22em] uppercase opacity-80">
                Step {index + 1}
              </div>
              <div className="text-base font-semibold">{stepLabels[step]}</div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
