import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'

interface ProfileAvatarPickerProps {
  avatar: string
  avatarPreview: string
  disabled: boolean
  isUploading: boolean
  onChangeImage: () => void | Promise<void>
  onRemoveImage: () => void
  userName: string
}

export function ProfileAvatarPicker({
  avatar,
  avatarPreview,
  disabled,
  isUploading,
  onChangeImage,
  onRemoveImage,
  userName,
}: ProfileAvatarPickerProps) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="border-input ring-offset-background focus-visible:ring-ring relative h-28 w-28 rounded-full border-2 p-0 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Profile image options"
              disabled={disabled}
            >
              <Avatar className="h-28 w-28">
                <AvatarImage
                  src={
                    avatarPreview ||
                    avatar ||
                    '/assets/icons/profile-placeholder.svg'
                  }
                  alt="profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-xl font-semibold">
                  {userName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
            <DropdownMenuItem disabled={disabled} onSelect={onChangeImage}>
              Change Image
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled} onSelect={onRemoveImage}>
              Remove Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isUploading ? (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-full">
            <Spinner size="sm" />
          </div>
        ) : null}
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        Click avatar for image options
      </p>
    </div>
  )
}
