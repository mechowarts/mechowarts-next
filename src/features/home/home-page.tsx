import { listPosts } from '@/api/http/posts'
import { Spinner } from '@/components/ui/spinner'
import { CreatePostModal } from '@/features/posts/create-post-modal'
import { useAuth } from '@/hooks/use-auth'
import { AddSquareIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export function HomePage() {
  const { user } = useAuth()
  const avatarUrl =
    user && 'avatarUrl' in user && typeof user.avatarUrl === 'string'
      ? user.avatarUrl
      : '/assets/icons/profile-placeholder.svg'
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: listPosts,
  })

  return (
    <div className="flex flex-1">
      <div className="w-full px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-foreground w-full text-left text-2xl font-semibold md:text-3xl">
            Home Feed
          </h2>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="border-border bg-card hover:bg-accent mt-6 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors"
          >
            <img
              src={avatarUrl}
              alt="profile"
              className="h-12 w-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="text-muted-foreground">
                {`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
              </p>
            </div>

            <HugeiconsIcon
              icon={AddSquareIcon}
              className="h-6 w-6 opacity-70"
            />
          </button>

          <div className="mt-8 space-y-4">
            {postsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="text-primary size-8" />
              </div>
            ) : postsQuery.data && postsQuery.data.length > 0 ? (
              postsQuery.data.map((post) => (
                <article
                  key={post.id}
                  className="border-border bg-card rounded-2xl border p-5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-foreground text-sm font-semibold">
                      {post.authorName || 'Unknown user'}
                    </p>
                  </div>

                  <p className="text-foreground whitespace-pre-wrap">
                    {post.caption}
                  </p>

                  {post.location ? (
                    <p className="text-muted-foreground mt-3 text-sm">
                      {post.location}
                    </p>
                  ) : null}

                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt="post"
                      className="border-border mt-4 max-h-96 w-full rounded-xl border object-cover"
                    />
                  ) : null}
                </article>
              ))
            ) : (
              <div className="text-muted-foreground py-12 text-center">
                <p>No posts found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </div>
  )
}
