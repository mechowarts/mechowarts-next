import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface AuthStageTilesProps<TStep extends string> {
  currentIndex: number
  steps: Array<{ id: TStep; label: string }>
}

export function AuthStageTiles<TStep extends string>({
  currentIndex,
  steps,
}: AuthStageTilesProps<TStep>) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-2">
      {steps.map((item, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        return (
          <div
            key={item.id}
            className={cn(
              'rounded-2xl px-3 py-3 text-center text-sm transition-colors',
              isActive &&
                'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200',
              isCompleted && 'bg-emerald-100 text-emerald-900',
              !isActive && !isCompleted && 'text-slate-500'
            )}
          >
            <div className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border text-[10px]',
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : isActive
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-500'
                )}
              >
                {isCompleted ? <Check className="size-3" /> : index + 1}
              </span>
              Step {index + 1}
            </div>
            <p className="font-medium">{item.label}</p>
          </div>
        )
      })}
    </div>
  )
}
