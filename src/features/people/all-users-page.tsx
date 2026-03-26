import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { listUsers } from '@/server/actions/users.actions'
import { useAuthStore } from '@/store/use-auth-store'
import { normalizeWhatsappPhone } from '@/utils/roll'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FaDroplet, FaFacebook, FaHouse, FaWhatsapp } from 'react-icons/fa6'

const usersPerPage = 9

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

export function AllUsersPage() {
  const router = useRouter()
  const user = useAuthStore((store) => store.user)

  const allUsersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [bloodGroupFilter, setBloodGroupFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'roll'>('name')

  const users = useMemo(() => {
    return (allUsersQuery.data ?? []).filter(
      (u) => u.visibility !== 'private' || u.roll === user?.roll
    )
  }, [allUsersQuery.data, user?.roll])

  const filteredUsers = useMemo(() => {
    let nextUsers = users

    if (searchTerm.trim()) {
      const loweredSearch = searchTerm.toLowerCase()
      nextUsers = nextUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(loweredSearch) ||
          user.email.toLowerCase().includes(loweredSearch) ||
          String(user.roll ?? '').includes(searchTerm)
      )
    }

    if (bloodGroupFilter) {
      nextUsers = nextUsers.filter(
        (user) => user.bloodGroup === bloodGroupFilter
      )
    }

    return [...nextUsers].sort((left, right) => {
      if (sortBy === 'name') {
        return left.name.localeCompare(right.name)
      }

      return (left.roll ?? 0) - (right.roll ?? 0)
    })
  }, [bloodGroupFilter, searchTerm, sortBy, users])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )
  const bloodGroups = Array.from(
    new Set(
      users
        .map((user) => user.bloodGroup)
        .filter((bloodGroup): bloodGroup is string => Boolean(bloodGroup))
    )
  )

  return (
    <div className="flex flex-1">
      <div className="w-full px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              type="text"
              placeholder="Search by name, email, or roll number"
              className="h-12 w-full md:w-80"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
            />

            <div className="flex w-full gap-2 md:w-auto">
              <Select
                value={bloodGroupFilter || 'all'}
                onValueChange={(value: string) => {
                  setBloodGroupFilter(value === 'all' ? '' : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-12 flex-1 md:w-auto">
                  <SelectValue placeholder="All Blood Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  {bloodGroups.map((bloodGroup) => (
                    <SelectItem key={bloodGroup} value={bloodGroup}>
                      {bloodGroup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: string) => {
                  setSortBy(value as 'name' | 'roll')
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-12 flex-1 md:w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="roll">Sort by Roll</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 w-full">
            {allUsersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="text-primary size-8" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                <p>
                  {searchTerm
                    ? 'No users found matching your search.'
                    : 'No users found.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedUsers.map((u) => {
                    const isCurrentUser = u.roll === user?.roll

                    return (
                      <div
                        key={u.id}
                        className={
                          isCurrentUser
                            ? 'group ring-primary/30 hover:border-primary border-border bg-card hover:bg-accent/60 flex h-72 cursor-pointer flex-col justify-between gap-3 rounded-xl border p-5 ring-2 transition-all duration-200'
                            : 'group hover:border-primary border-border bg-card hover:bg-accent/60 flex h-72 cursor-pointer flex-col justify-between gap-3 rounded-xl border p-5 transition-all duration-200'
                        }
                        onClick={(event) => {
                          if (!(event.target as HTMLElement).closest('a')) {
                            router.push(`/profile/${u.roll}`)
                          }
                        }}
                      >
                        <>
                          <img
                            src={
                              u.avatar ||
                              '/assets/icons/profile-placeholder.svg'
                            }
                            alt={u.name}
                            className="group-hover:border-primary border-input h-16 w-16 rounded-full border object-cover transition-all duration-200"
                          />

                          <h3 className="text-foreground mt-2 text-center text-lg font-bold">
                            {u.name}
                            {u.roll ? (
                              <span className="text-muted-foreground ml-2 text-xs">
                                ({u.roll})
                              </span>
                            ) : null}
                            {isCurrentUser ? (
                              <span className="text-primary ml-2 text-xs">
                                (You)
                              </span>
                            ) : null}
                          </h3>

                          <div className="text-foreground/80 mt-1 flex items-center gap-2 text-xs">
                            {u.bloodGroup ? (
                              <span className="flex items-center gap-1">
                                <FaDroplet className="text-primary mr-1 inline-block" />
                                {u.bloodGroup}
                              </span>
                            ) : null}

                            {u.location ? (
                              <span className="flex items-center gap-1">
                                <FaHouse className="text-primary mr-1 inline-block" />
                                {u.location}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 flex gap-3">
                            {u.phone ? (
                              <a
                                href={`https://wa.me/${normalizeWhatsappPhone(u.phone)}`}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp"
                                onClick={(event) => event.stopPropagation()}
                                className="text-primary text-2xl transition-transform hover:scale-110"
                              >
                                <FaWhatsapp className="h-6 w-6" />
                              </a>
                            ) : null}

                            {u.facebookId ? (
                              <a
                                href={getFacebookUrl(u.facebookId)}
                                target="_blank"
                                rel="noreferrer"
                                title="Facebook"
                                onClick={(event) => event.stopPropagation()}
                                className="text-primary text-2xl transition-transform hover:scale-110"
                              >
                                <FaFacebook className="h-6 w-6" />
                              </a>
                            ) : null}
                          </div>
                        </>
                      </div>
                    )
                  })}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'secondary'}
                        size="sm"
                        className={currentPage === page ? '' : 'bg-muted'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
