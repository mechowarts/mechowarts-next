import { getDisplayName } from '@/utils/roll'

interface AuthUserPreviewProps {
  avatarUrl?: string
  name: string
}

export function AuthUserPreview({ avatarUrl, name }: AuthUserPreviewProps) {
  const displayName = getDisplayName(name)

  return (
    <>
      <div className="mb-4 flex justify-center">
        <img
          src={avatarUrl || '/assets/icons/profile-placeholder.svg'}
          alt="User avatar"
          className="border-primary/30 bg-muted h-16 w-16 rounded-full border-2 object-cover shadow-sm"
        />
      </div>

      <h2 className="text-foreground mb-2 text-center text-2xl font-bold">
        Welcome, {displayName}!
      </h2>
      <p className="text-muted-foreground mb-6 text-center">
        Please Log in to your account
      </p>
    </>
  )
}
