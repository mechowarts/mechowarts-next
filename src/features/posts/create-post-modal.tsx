import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Button, Loading } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createPost } from '@/server/actions/posts.actions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const queryClient = useQueryClient()
  const form = useForm({
    defaultValues: {
      caption: '',
      location: '',
    },
  })
  const createPostMutation = useMutation({
    mutationFn: createPost,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  return (
    <BetterDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BetterDialogContent title="Create Post">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ caption, location }) => {
              createPostMutation.mutate(
                {
                  caption: caption.trim(),
                  location: location.trim() || undefined,
                },
                {
                  onSuccess() {
                    toast.success('Post created successfully!')
                    form.reset()
                    onClose()
                  },
                  onError(error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Failed to create post.'
                    )
                  },
                }
              )
            })}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="caption"
                rules={{
                  required: 'Caption is required.',
                  validate: (value) =>
                    value.trim().length > 0 || 'Caption is required.',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What's on your mind?"
                        className="min-h-40 resize-none"
                        disabled={createPostMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Add a location (optional)"
                        className="h-12"
                        disabled={createPostMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={createPostMutation.isPending}>
                <Loading loading={createPostMutation.isPending}>Post</Loading>
              </Button>
            </div>
          </form>
        </Form>
      </BetterDialogContent>
    </BetterDialog>
  )
}
