import { Image01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function GalleryPage() {
  return (
    <div className="flex flex-1">
      <div className="w-full px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-start gap-3">
          <HugeiconsIcon icon={Image01Icon} className="h-9 w-9" />
          <h2 className="text-foreground w-full text-left text-2xl font-semibold md:text-3xl">
            Gallery
          </h2>
        </div>

        <div className="mx-auto mt-8 w-full max-w-5xl">
          <div className="border-border bg-card rounded-2xl border p-8 text-center">
            <p className="text-muted-foreground">Not implemented.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
