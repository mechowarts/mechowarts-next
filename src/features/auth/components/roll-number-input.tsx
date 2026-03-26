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
      <NumberInput
        value={digits[0]}
        disabled={disabled}
        onChange={(val) => updateDigits([val, digits[1], digits[2], digits[3]])}
      />
      <NumberInput
        value={digits[1]}
        disabled={disabled}
        onChange={(val) => updateDigits([digits[0], val, digits[2], digits[3]])}
      />

      <div className="bg-muted text-muted-foreground flex aspect-[1/1.25] h-auto w-full items-center justify-center rounded-md border p-0 text-xl font-semibold">
        0
      </div>
      <div className="bg-muted text-muted-foreground flex aspect-[1/1.25] h-auto w-full items-center justify-center rounded-md border p-0 text-xl font-semibold">
        8
      </div>
      <div className="bg-muted text-muted-foreground flex aspect-[1/1.25] h-auto w-full items-center justify-center rounded-md border p-0 text-xl font-semibold">
        0
      </div>

      <NumberInput
        value={digits[2]}
        disabled={disabled}
        onChange={(val) => updateDigits([digits[0], digits[1], val, digits[3]])}
      />
      <NumberInput
        value={digits[3]}
        disabled={disabled}
        onChange={(val) => updateDigits([digits[0], digits[1], digits[2], val])}
      />
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      value={value}
      onChange={(e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 1)
        onChange(val)

        let nextInput = e.currentTarget.nextElementSibling
        while (nextInput && nextInput.tagName !== 'INPUT') {
          nextInput = nextInput.nextElementSibling
        }

        if (val && nextInput instanceof HTMLInputElement) {
          nextInput.focus()
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Backspace') {
          onChange('')

          let prevInput = e.currentTarget.previousElementSibling
          while (prevInput && prevInput.tagName !== 'INPUT') {
            prevInput = prevInput.previousElementSibling
          }

          if (prevInput instanceof HTMLInputElement) {
            e.preventDefault()
            prevInput.focus()
          }
        }
      }}
      className="bg-muted text-foreground hover:border-input focus:border-primary focus:bg-background focus:ring-primary/10 aspect-[1/1.25] h-auto w-full border p-0 text-center text-xl font-semibold transition-all focus:ring-2 disabled:opacity-50"
    />
  )
}
