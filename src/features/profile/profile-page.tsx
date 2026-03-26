import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserByRoll } from '@/server/actions/users.actions'
import { useAuthStore } from '@/store/use-auth-store'
import { normalizeWhatsappPhone } from '@/utils/roll'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  FaBuildingColumns,
  FaDroplet,
  FaFacebook,
  FaHouse,
  FaPenToSquare,
  FaSchool,
  FaWhatsapp,
} from 'react-icons/fa6'

function getFacebookUrl(facebookId: string) {
  const trimmed = facebookId.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://facebook.com/${trimmed}`
}

export function ProfilePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = typeof params.id === 'string' ? params.id : ''
  const user = useAuthStore((store) => store.user)

  const currentUserRoll =
    user && 'roll' in user && typeof user.roll === 'number'
      ? user.roll
      : undefined
  const profileQuery = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getUserByRoll(id),
    enabled: Boolean(id),
  })
  const colleges = (profileQuery.data?.institutions ?? []).filter(
    (institution) => institution.kind === 'college'
  )
  const schools = (profileQuery.data?.institutions ?? []).filter(
    (institution) => institution.kind === 'school'
  )
  const [activeTab, setActiveTab] = useState<'info' | 'posts'>('info')
  const isOwnProfile = id === String(currentUserRoll)

  if (profileQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-primary size-8" />
      </div>
    )
  }

  if (!profileQuery.data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  if (profileQuery.data.visibility === 'private' && !isOwnProfile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="border-border bg-card max-w-md rounded-xl border p-8 text-center">
          <span className="mb-4 block text-6xl">Locked</span>
          <h2 className="text-foreground mb-2 text-2xl font-bold">
            Private Profile
          </h2>
          <p className="text-muted-foreground mb-4">
            This profile is set to private and cannot be viewed.
          </p>
          <Button onClick={() => router.push('/users')}>
            Back to All Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-1 overflow-y-auto">
      <div className="mx-auto mt-8 mb-8 w-full max-w-5xl px-4 md:px-8">
        <div className="border-border bg-card relative mt-10 flex flex-col items-center rounded-2xl border px-6 pt-10 pb-8">
          {isOwnProfile ? (
            <Link
              href={`/update-profile/${id}`}
              className="absolute top-4 right-4"
            >
              <Button variant="outline" className="flex gap-2">
                <FaPenToSquare className="mr-1 inline-block h-4 w-4 align-text-bottom" />
                Edit Profile
              </Button>
            </Link>
          ) : null}

          <img
            src={
              profileQuery.data.avatar ||
              '/assets/icons/profile-placeholder.svg'
            }
            alt={profileQuery.data.name}
            className="bg-card border-background -mt-20 mb-2 h-32 w-32 rounded-full border-4 object-cover shadow-xl"
          />

          <h1 className="text-foreground mt-2 flex items-center justify-center gap-2 text-3xl font-bold">
            {profileQuery.data.name}
            {profileQuery.data.visibility === 'public' ? (
              <span title="Public">Public</span>
            ) : (
              <span title="Private">Private</span>
            )}
          </h1>

          <span className="text-muted-foreground mt-1 mb-2 text-sm">
            {profileQuery.data.email}
          </span>

          {profileQuery.data.bio ? (
            <div className="text-foreground/80 mb-4 w-full max-w-xl text-center text-base">
              {profileQuery.data.bio}
            </div>
          ) : null}

          <div className="mt-2 mb-2 flex flex-wrap justify-center gap-4">
            {profileQuery.data.phone ? (
              <a
                href={`https://wa.me/${normalizeWhatsappPhone(profileQuery.data.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex min-w-36 items-center justify-center gap-2 rounded-lg px-5 py-3 text-lg font-semibold transition"
              >
                <FaWhatsapp className="h-7 w-7" />
                WhatsApp
              </a>
            ) : null}

            {profileQuery.data.facebookId ? (
              <a
                href={getFacebookUrl(profileQuery.data.facebookId)}
                target="_blank"
                rel="noreferrer"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex min-w-36 items-center justify-center gap-2 rounded-lg px-5 py-3 text-lg font-semibold transition"
              >
                <FaFacebook className="h-7 w-7" />
                Facebook
              </a>
            ) : null}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value: string) =>
              setActiveTab(value as 'info' | 'posts')
            }
            className="mt-8 w-full"
          >
            <TabsList className="mx-auto mb-6">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="flex w-full flex-col gap-8 md:flex-row">
                <div className="flex-1 space-y-3">
                  {profileQuery.data.bloodGroup ? (
                    <div className="text-foreground/90">
                      <span className="font-semibold">
                        <FaDroplet className="text-primary mr-1 inline-block" />{' '}
                        Blood Group:
                      </span>{' '}
                      {profileQuery.data.bloodGroup}
                    </div>
                  ) : null}

                  {profileQuery.data.location ? (
                    <div className="text-foreground/90">
                      <span className="font-semibold">
                        <FaHouse className="text-primary mr-1 inline-block" />{' '}
                        Home Town:
                      </span>{' '}
                      {profileQuery.data.location}
                    </div>
                  ) : null}

                  {colleges.length > 0 ? (
                    <div className="text-foreground/90">
                      <span className="font-semibold">
                        <FaBuildingColumns className="text-primary mr-1 inline-block" />{' '}
                        Colleges:
                      </span>

                      <ul className="ml-4 list-disc">
                        {colleges.map((college, index) => (
                          <li key={`college-${index}`}>
                            {college.name || 'Unnamed College'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {schools.length > 0 ? (
                    <div className="text-foreground/90">
                      <span className="font-semibold">
                        <FaSchool className="text-primary mr-1 inline-block" />{' '}
                        Schools:
                      </span>

                      <ul className="ml-4 list-disc">
                        {schools.map((school, index) => (
                          <li key={`school-${index}`}>
                            {school.name || 'Unnamed School'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="border-border bg-card rounded-xl border p-8 text-center shadow-sm">
                <h3 className="text-foreground mb-2 text-lg font-bold">
                  Posts
                </h3>
                <p className="text-muted-foreground">Not implemented.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
