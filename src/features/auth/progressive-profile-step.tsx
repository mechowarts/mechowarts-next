import { Button, Loading } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { bloodGroups } from '@/constants/profile'
import type { ProfileData } from '@/types'
import { useFieldArray, useForm } from 'react-hook-form'
import PhoneInput from 'react-phone-input-2'

interface ProgressiveProfileStepProps {
  isLoading: boolean
  onSkip: () => void
  onSubmit: (values: ProfileData) => void | Promise<void>
}

export function ProgressiveProfileStep({
  isLoading,
  onSkip,
  onSubmit,
}: ProgressiveProfileStepProps) {
  const form = useForm<ProfileData>({
    defaultValues: {
      bio: '',
      bloodGroup: '',
      colleges: [{ location: '', name: '' }],
      facebook: '',
      homeTown: '',
      name: '',
      schools: [{ location: '', name: '' }],
      whatsapp: '',
      whatsappCountry: '',
    },
  })
  const whatsappCountry = form.watch('whatsappCountry') || ''
  const colleges = useFieldArray({ control: form.control, name: 'colleges' })
  const schools = useFieldArray({ control: form.control, name: 'schools' })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values)
        })}
        className="space-y-4"
      >
        <div className="text-center">
          <h2 className="text-foreground mb-2 text-2xl font-bold">
            Additional Info (Optional)
          </h2>
          <p className="text-muted-foreground">
            You can skip this step and fill it later from your profile.
          </p>
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="A short bio about you"
                  className="min-h-24 resize-y"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bloodGroup"
          render={({ field }) => (
            <FormItem>
              <Select
                value={field.value || 'none'}
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? '' : value)
                }
              >
                <FormControl>
                  <SelectTrigger className="h-10 w-full" disabled={isLoading}>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Select blood group</SelectItem>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="homeTown"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Your home town"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PhoneInput
                  country={
                    whatsappCountry
                      ? whatsappCountry.replace('+', '').toLowerCase()
                      : 'bd'
                  }
                  value={field.value || ''}
                  onChange={(value, data) => {
                    field.onChange(value)
                    form.setValue(
                      'whatsappCountry',
                      'dialCode' in data && data.dialCode
                        ? `+${data.dialCode}`
                        : ''
                    )
                  }}
                  inputClass="!w-full !h-11 !rounded-lg !border-input !pl-14 !text-base"
                  buttonClass="!h-11 !w-12 !rounded-l-lg !border !border-input !bg-muted"
                  dropdownClass="!rounded-lg !text-base !shadow-lg"
                  containerClass="!w-full"
                  placeholder="Enter WhatsApp number"
                  enableSearch
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://facebook.com/yourprofile"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Colleges Attended</Label>
          {colleges.fields.map((college, index) => (
            <div key={college.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`colleges.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={`College ${index + 1} Name`}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`colleges.${index}.location`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        value={field.value || ''}
                        placeholder="Location"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {colleges.fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => colleges.remove(index)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => colleges.append({ name: '', location: '' })}
            disabled={isLoading}
          >
            + Add another college
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Schools Attended</Label>
          {schools.fields.map((school, index) => (
            <div key={school.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`schools.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={`School ${index + 1} Name`}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`schools.${index}.location`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        value={field.value || ''}
                        placeholder="Location"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {schools.fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => schools.remove(index)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => schools.append({ name: '', location: '' })}
            disabled={isLoading}
          >
            + Add another school
          </Button>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            <Loading loading={isLoading}>Save & Continue</Loading>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onSkip}
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </Form>
  )
}
