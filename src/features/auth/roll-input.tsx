import { Button, Loading } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { rollNumberPattern, rollTemplate } from '@/constants/auth'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'

interface RollInputProps {
  isLoading?: boolean
  onSubmit: (roll: string) => void | Promise<void>
}

function updateRollValue(
  currentValue: string[],
  index: number,
  nextDigit: string
) {
  const nextDigits = [...currentValue]
  nextDigits[index] = nextDigit

  return nextDigits
}

export function RollInput({ isLoading = false, onSubmit }: RollInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const form = useForm<{ roll: string[] }>({
    defaultValues: {
      roll: rollTemplate,
    },
  })

  function setInputRef(index: number) {
    return (element: HTMLInputElement | null) => {
      inputRefs.current[index] = element
    }
  }

  function handleKeyDown(
    index: number,
    digits: string[],
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if ([2, 3, 4].includes(index)) {
      event.preventDefault()
      return
    }

    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      let previousIndex = index - 1

      while ([2, 3, 4].includes(previousIndex) && previousIndex > 0) {
        previousIndex -= 1
      }

      inputRefs.current[previousIndex]?.focus()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async ({ roll }) => {
          await onSubmit(roll.join(''))
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="roll"
          rules={{
            validate: (value) =>
              rollNumberPattern.test(value.join('')) ||
              'Enter a valid roll number.',
          }}
          render={({ field }) => {
            const digits = field.value

            return (
              <FormItem>
                <FormLabel htmlFor="roll-number">Roll Number</FormLabel>
                <FormControl>
                  <div className="bg-muted my-4 flex items-center justify-center gap-2 rounded-lg p-4">
                    {digits.map((digit, index) => {
                      const isPrefilled =
                        index === 2 || index === 3 || index === 4

                      return (
                        <Input
                          key={index}
                          id={index === 0 ? 'roll-number' : undefined}
                          type="text"
                          name={field.name}
                          value={digit}
                          onChange={(event) => {
                            if (isPrefilled) {
                              return
                            }

                            const nextDigit = event.target.value
                              .replace(/\D/g, '')
                              .slice(0, 1)

                            field.onChange(
                              updateRollValue(field.value, index, nextDigit)
                            )

                            if (!nextDigit) {
                              return
                            }

                            let nextIndex = index + 1

                            while (
                              [2, 3, 4].includes(nextIndex) &&
                              nextIndex < 6
                            ) {
                              nextIndex += 1
                            }

                            inputRefs.current[nextIndex]?.focus()
                          }}
                          onBlur={field.onBlur}
                          maxLength={1}
                          className={
                            isPrefilled
                              ? 'pointer-events-none w-10 text-center font-mono text-lg tracking-wider select-none'
                              : 'w-10 text-center font-mono text-lg tracking-wider'
                          }
                          style={{ minWidth: 0 }}
                          ref={setInputRef(index)}
                          onKeyDown={(event) =>
                            handleKeyDown(index, digits, event)
                          }
                          onFocus={
                            isPrefilled
                              ? undefined
                              : (event) => event.target.select()
                          }
                          aria-label={`Digit ${index + 1}`}
                          readOnly={isPrefilled}
                          tabIndex={isPrefilled ? -1 : 0}
                          disabled={isLoading}
                        />
                      )
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          <Loading loading={isLoading}>Continue</Loading>
        </Button>
      </form>
    </Form>
  )
}
