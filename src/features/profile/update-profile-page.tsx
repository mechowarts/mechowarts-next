import { Button } from '@/components/ui/button'
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
import { ProfileAvatarPicker } from '@/features/profile/profile-avatar-picker'
import {
  createProfileState,
  revokeObjectUrl,
} from '@/features/profile/profile-form-utils'
import { changeUserAvatar } from '@/server/actions/avatar.actions'
import { updateUserProfile } from '@/server/actions/users.actions'
import { useAuthStore } from '@/store/use-auth-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { openFileExplorer } from 'daily-code/browser'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

type InstitutionFormValue = {
  location: string
  name: string
}

type ProfileFormValues = {
  avatar: string
  bio: string
  bloodGroup: string
  colleges: InstitutionFormValue[]
  email: string
  facebookId: string
  location: string
  id: string
  visibility: 'private' | 'public'
  name: string
  phone: string
  roll: number | undefined
  schools: InstitutionFormValue[]
}

export function UpdateProfilePage() {
  const refetch = useAuthStore((store) => store.refetch)
  const user = useAuthStore((store) => store.user)

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
  const avatar = form.watch('avatar')
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ?? '')
  const avatarObjectUrlRef = useRef<null | string>(null)
  const colleges = useFieldArray({ control: form.control, name: 'colleges' })
  const schools = useFieldArray({ control: form.control, name: 'schools' })
  const updateProfileMutation = useMutation({
    mutationFn: (profile: ProfileFormValues) =>
      updateUserProfile(user.id, {
        avatar: profile.avatar,
        bio: profile.bio,
        bloodGroup: profile.bloodGroup,
        facebookId: profile.facebookId,
        location: profile.location,
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
        visibility: profile.visibility,
        name: profile.name,
        phone: profile.phone,
      }),
    async onSuccess(_, profile) {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({
        queryKey: ['profile', String(profile.roll)],
      })
      await refetch()
    },
  })
  const uploadAvatarMutation = useMutation({
    mutationFn: changeUserAvatar,
  })
  const isSubmitting =
    updateProfileMutation.isPending || uploadAvatarMutation.isPending

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

                updateProfileMutation.mutate(profile, {
                  onSuccess() {
                    toast.success('Profile updated successfully!')
                    router.push(`/profile/${user.roll}`)
                  },
                  onError(error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Failed to update profile. Please try again.'
                    )
                  },
                })
              })}
              className="border-border bg-card rounded-xl border p-8"
            >
              <ProfileAvatarPicker
                avatar={avatar}
                avatarPreview={avatarPreview}
                userName={user.name}
                disabled={isSubmitting}
                isUploading={uploadAvatarMutation.isPending}
                onChangeImage={async () => {
                  try {
                    const fileList = await openFileExplorer({
                      accept: 'image/*',
                    })
                    const file = fileList[0]

                    if (!file) {
                      return
                    }

                    const previousAvatar = form.getValues('avatar')
                    const objectUrl = URL.createObjectURL(file)

                    revokeObjectUrl(avatarObjectUrlRef.current)
                    avatarObjectUrlRef.current = objectUrl
                    setAvatarPreview(objectUrl)

                    uploadAvatarMutation.mutate(file, {
                      onSuccess(updatedUser) {
                        revokeObjectUrl(avatarObjectUrlRef.current)
                        avatarObjectUrlRef.current = null
                        setAvatarPreview(updatedUser.avatar)
                        form.setValue('avatar', updatedUser.avatar)
                        toast.success('Avatar updated successfully!')
                      },
                      onError(error) {
                        revokeObjectUrl(avatarObjectUrlRef.current)
                        avatarObjectUrlRef.current = null
                        setAvatarPreview(previousAvatar)
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Failed to upload avatar. Please try again.'
                        )
                      },
                    })
                  } catch {}
                }}
                onRemoveImage={() => {
                  revokeObjectUrl(avatarObjectUrlRef.current)
                  avatarObjectUrlRef.current = null
                  setAvatarPreview('')
                  form.setValue('avatar', '')
                }}
              />

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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={field.value || ''}
                          placeholder="Your location"
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
                  name="facebookId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={field.value || ''}
                          placeholder="facebook username"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile visibility</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <p className="text-muted-foreground text-sm">
                        Public profiles are visible to everyone.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/profile/${user.roll}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[7.5rem]"
                  disabled={isSubmitting}
                >
                  Save Changes
                  {isSubmitting && <Spinner />}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
