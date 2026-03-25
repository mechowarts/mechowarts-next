import { AddSquareIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function CreatePostPage() {
  return (
    <div className="flex flex-1">
      <div className="w-full px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-start gap-3">
          <HugeiconsIcon icon={AddSquareIcon} className="h-9 w-9" />
          <h2 className="text-foreground w-full text-left text-2xl font-semibold md:text-3xl">
            Create Post
          </h2>
        </div>
      </div>
    </div>
  )
}
