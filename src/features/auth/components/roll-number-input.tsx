import { Input } from '@/components/ui/input'
import { useState } from 'react'

const FIXED_MIDDLE = '080'

interface RollNumberInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function RollNumberInput({
  value,
  onChange,
  disabled,
}: RollNumberInputProps) {
  const [digits, setDigits] = useState(() => {
    if (value && value.length === 7) {
      return [value[0], value[1], value[5], value[6]]
    }
    return ['', '', '', '']
  })

  function updateDigits(newDigits: string[]) {
    setDigits(newDigits)
    onChange(
      newDigits[0] + newDigits[1] + FIXED_MIDDLE + newDigits[2] + newDigits[3]
    )
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      <Input
        id="roll-digit-0"
        type="text"
        inputMode="numeric"
        value={digits[0]}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 1)
          updateDigits([val, digits[1], digits[2], digits[3]])
          if (val) document.getElementById('roll-digit-1')?.focus()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !digits[0]) {
            document.getElementById('roll-digit-0')?.focus()
          }
        }}
        className="aspect-[1/1.25] h-auto w-full border-slate-200 bg-slate-50 p-0 text-center text-xl font-semibold text-slate-900 transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
        maxLength={1}
      />
      <Input
        id="roll-digit-1"
        type="text"
        inputMode="numeric"
        value={digits[1]}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 1)
          updateDigits([digits[0], val, digits[2], digits[3]])
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !digits[1]) {
            document.getElementById('roll-digit-0')?.focus()
          }
        }}
        className="aspect-[1/1.25] h-auto w-full border-slate-200 bg-slate-50 p-0 text-center text-xl font-semibold text-slate-900 transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
        maxLength={1}
      />

      <div className="flex aspect-[1/1.25] h-auto w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 p-0 text-xl font-semibold text-slate-400">
        0
      </div>
      <div className="flex aspect-[1/1.25] h-auto w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 p-0 text-xl font-semibold text-slate-400">
        8
      </div>
      <div className="flex aspect-[1/1.25] h-auto w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 p-0 text-xl font-semibold text-slate-400">
        0
      </div>

      <Input
        id="roll-digit-2"
        type="text"
        inputMode="numeric"
        value={digits[2]}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 1)
          updateDigits([digits[0], digits[1], val, digits[3]])
          if (val) document.getElementById('roll-digit-3')?.focus()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !digits[2]) {
            document.getElementById('roll-digit-1')?.focus()
          }
        }}
        className="aspect-[1/1.25] h-auto w-full border-slate-200 bg-slate-50 p-0 text-center text-xl font-semibold text-slate-900 transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
        maxLength={1}
      />
      <Input
        id="roll-digit-3"
        type="text"
        inputMode="numeric"
        value={digits[3]}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 1)
          updateDigits([digits[0], digits[1], digits[2], val])
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !digits[3]) {
            document.getElementById('roll-digit-2')?.focus()
          }
        }}
        className="aspect-[1/1.25] h-auto w-full border-slate-200 bg-slate-50 p-0 text-center text-xl font-semibold text-slate-900 transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
        maxLength={1}
      />
    </div>
  )
}
