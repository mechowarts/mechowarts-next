import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, Loading } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { bloodGroups } from '@/constants/profile'
import {
  createProfileState,
  revokeObjectUrl,
} from '@/features/profile/profile-form-utils'
import { useAuth } from '@/hooks/use-auth'
import { changeUserAvatar } from '@/server/actions/avatar.actions'
import { updateUserProfile } from '@/server/actions/users.actions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { openFileExplorer } from 'daily-code/browser'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type InstitutionFormValue = {
  location: string
  name: string
}

type ProfileFormValues = {
  avatarUrl: string
  bio: string
  bloodGroup: string
  colleges: InstitutionFormValue[]
  email: string
  facebookUrl: string
  homeTown: string
  id: string
  isPublic: boolean
  name: string
  phone: string
  rollNumber: number | undefined
  schools: InstitutionFormValue[]
}

export function UpdateProfilePage() {
  const { refetch, user } = useAuth()

  if (!user) {
    throw new Error(
      'User must be authenticated to access the update profile page.'
    )
  }

  const router = useRouter()
  const queryClient = useQueryClient()
  const form = useForm<ProfileFormValues>({
    defaultValues: createProfileState(user),
  })
  const avatarUrl = form.watch('avatarUrl')
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? '')
  const avatarObjectUrlRef = useRef<null | string>(null)
  const colleges = useFieldArray({ control: form.control, name: 'colleges' })
  const schools = useFieldArray({ control: form.control, name: 'schools' })
  const updateProfileMutation = useMutation({
    mutationFn: (profile: ProfileFormValues) =>
      updateUserProfile(user.id, {
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        bloodGroup: profile.bloodGroup,
        facebookUrl: profile.facebookUrl,
        homeTown: profile.homeTown,
        institutions: [
          ...profile.colleges.map((institution) => ({
            kind: 'college' as const,
            name: institution.name,
            location: institution.location || undefined,
          })),
          ...profile.schools.map((institution) => ({
            kind: 'school' as const,
            name: institution.name,
            location: institution.location || undefined,
          })),
        ],
        isPublic: profile.isPublic,
        name: profile.name,
        phone: profile.phone,
      }),
    async onSuccess(_, profile) {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({
        queryKey: ['profile', String(profile.rollNumber)],
      })
      await refetch()
    },
  })
  const uploadAvatarMutation = useMutation({
    mutationFn: changeUserAvatar,
  })
  const isSubmitting =
    updateProfileMutation.isPending || uploadAvatarMutation.isPending

  useEffect(() => {
    return () => {
      revokeObjectUrl(avatarObjectUrlRef.current)
    }
  }, [])

  return (
    <div className="flex flex-1">
      <div className="w-full px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-3xl" role="img" aria-label="edit">
              Pencil
            </span>
            <h2 className="text-foreground text-2xl font-bold md:text-3xl">
              Edit Profile
            </h2>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((profile) => {
                if (uploadAvatarMutation.isPending) {
                  toast.info('Please wait for the avatar upload to finish.')
                  return
                }

                updateProfileMutation.mutate(
                  {
                    ...profile,
                    avatarUrl: profile.avatarUrl,
                  },
                  {
                    onSuccess() {
                      toast.success('Profile updated successfully!')
                      router.push(`/profile/${user.rollNumber}`)
                    },
                    onError(error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'Failed to update profile. Please try again.'
                      )
                    },
                  }
                )
              })}
              className="border-border bg-card rounded-xl border p-8"
            >
              <div className="mb-8 flex flex-col items-center">
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="border-input ring-offset-background focus-visible:ring-ring relative h-28 w-28 rounded-full border-2 p-0 focus-visible:ring-2 focus-visible:ring-offset-2"
                        aria-label="Profile image options"
                        disabled={isSubmitting}
                      >
                        <Avatar className="h-28 w-28">
                          <AvatarImage
                            src={
                              avatarPreview ||
                              avatarUrl ||
                              '/assets/icons/profile-placeholder.svg'
                            }
                            alt="profile"
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xl font-semibold">
                            {user.name
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part: string) => part[0]?.toUpperCase())
                              .join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-44">
                      <DropdownMenuItem
                        disabled={isSubmitting}
                        onSelect={async () => {
                          try {
                            const fileList = await openFileExplorer({
                              accept: 'image/*',
                            })
                            const file = fileList[0]

                            if (!file) {
                              return
                            }

                            const previousAvatarUrl =
                              form.getValues('avatarUrl')
                            const objectUrl = URL.createObjectURL(file)

                            revokeObjectUrl(avatarObjectUrlRef.current)
                            avatarObjectUrlRef.current = objectUrl
                            setAvatarPreview(objectUrl)

                            uploadAvatarMutation.mutate(file, {
                              onSuccess(updatedUser) {
                                revokeObjectUrl(avatarObjectUrlRef.current)
                                avatarObjectUrlRef.current = null
                                setAvatarPreview(updatedUser.avatarUrl)
                                form.setValue(
                                  'avatarUrl',
                                  updatedUser.avatarUrl
                                )
                                toast.success('Avatar updated successfully!')
                              },
                              onError(error) {
                                revokeObjectUrl(avatarObjectUrlRef.current)
                                avatarObjectUrlRef.current = null
                                setAvatarPreview(previousAvatarUrl)
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : 'Failed to upload avatar. Please try again.'
                                )
                              },
                            })
                          } catch {}
                        }}
                      >
                        Change Image
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isSubmitting}
                        onSelect={() => {
                          revokeObjectUrl(avatarObjectUrlRef.current)
                          avatarObjectUrlRef.current = null
                          setAvatarPreview('')
                          form.setValue('avatarUrl', '')
                        }}
                      >
                        Remove Image
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {uploadAvatarMutation.isPending ? (
                    <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-full">
                      <Spinner size="sm" />
                    </div>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  Click avatar for image options
                </p>
              </div>

              <div className="mb-6 space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Name is required.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Your name"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Email cannot be changed
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px] resize-y"
                          disabled={isSubmitting}
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
                      <FormLabel>Blood Group</FormLabel>
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(value) =>
                          field.onChange(value === 'none' ? '' : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-10 w-full"
                            disabled={isSubmitting}
                          >
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            Select blood group
                          </SelectItem>
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
                      <FormLabel>Home Town</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={field.value || ''}
                          placeholder="Your home town"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Label className="mb-2 block">Colleges</Label>
                  <div className="space-y-2">
                    {colleges.fields.map((fieldItem, index) => (
                      <div
                        key={fieldItem.id}
                        className="flex items-center gap-2"
                      >
                        <FormField
                          control={form.control}
                          name={`colleges.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="text"
                                  value={field.value || ''}
                                  placeholder="College name"
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => colleges.remove(index)}
                          disabled={isSubmitting}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        colleges.append({ location: '', name: '' })
                      }
                      disabled={isSubmitting}
                    >
                      Add College
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Schools</Label>
                  <div className="space-y-2">
                    {schools.fields.map((fieldItem, index) => (
                      <div
                        key={fieldItem.id}
                        className="flex items-center gap-2"
                      >
                        <FormField
                          control={form.control}
                          name={`schools.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="text"
                                  value={field.value || ''}
                                  placeholder="School name"
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => schools.remove(index)}
                          disabled={isSubmitting}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => schools.append({ location: '', name: '' })}
                      disabled={isSubmitting}
                    >
                      Add School
                    </Button>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          value={field.value || ''}
                          placeholder="Your phone number"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          value={field.value || ''}
                          placeholder="https://facebook.com/yourprofile"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="is-public"
                          checked={field.value === true}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel htmlFor="is-public" className="cursor-pointer">
                        Make profile public (visible to all users)
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/profile/${user.rollNumber}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[7.5rem]"
                  disabled={isSubmitting}
                >
                  <Loading loading={isSubmitting}>Save Changes</Loading>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
