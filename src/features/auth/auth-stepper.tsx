import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProgressiveAuthStep } from '@/types'

interface AuthStepperProps {
  currentStepIndex: number
  goToStep: (index: number) => void
  stepHistory: ProgressiveAuthStep[]
}

export function AuthStepper({
  currentStepIndex,
  goToStep,
  stepHistory,
}: AuthStepperProps) {
  return (
    <div className="mb-6 flex items-center justify-center gap-0">
      {stepHistory.map((step, index) => {
        const isActive = index === currentStepIndex
        const isCompleted = index < currentStepIndex

        return (
          <div key={`${step}-${index}`} className="contents">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!isCompleted}
              onClick={() => goToStep(index)}
              className={cn(
                'rounded-full border-2 text-sm font-semibold transition-colors duration-200',
                isActive &&
                  'border-primary bg-primary text-primary-foreground shadow-lg',
                isCompleted &&
                  'border-primary bg-primary/30 text-primary hover:ring-primary/30 hover:ring-2',
                !isActive &&
                  !isCompleted &&
                  'border-border bg-muted text-muted-foreground cursor-default'
              )}
            >
              {index + 1}
            </Button>

            {index < stepHistory.length - 1 ? (
              <span
                className={cn(
                  'mx-1 h-1 w-8 rounded-full',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
