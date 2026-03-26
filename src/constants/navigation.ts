import {
  Bookmark01Icon,
  Home01Icon,
  Image01Icon,
  MapsSearchIcon,
  ToolsIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { IconSvgElement } from '@hugeicons/react'

interface NavigationItem {
  icon: IconSvgElement
  route: string
  label: string
  isPrivate?: boolean
}

export const sidebarLinks: NavigationItem[] = [
  {
    icon: Home01Icon,
    route: '/',
    label: 'Home',
    isPrivate: true,
  },
  {
    icon: MapsSearchIcon,
    route: '/explore',
    label: 'Explore',
    isPrivate: true,
  },
  {
    icon: UserGroupIcon,
    route: '/users',
    label: 'People',
  },
  {
    icon: Image01Icon,
    route: '/gallery',
    label: 'Gallery',
  },
  {
    icon: Bookmark01Icon,
    route: '/saved',
    label: 'Saved',
    isPrivate: true,
  },
  {
    icon: ToolsIcon,
    route: '/tools',
    label: 'Tools',
  },
]

export const bottomBarLinks: NavigationItem[] = [
  {
    icon: Home01Icon,
    route: '/',
    label: 'Home',
    isPrivate: true,
  },
  {
    icon: MapsSearchIcon,
    route: '/explore',
    label: 'Explore',
    isPrivate: true,
  },
  {
    icon: UserGroupIcon,
    route: '/users',
    label: 'People',
  },
  {
    icon: Image01Icon,
    route: '/gallery',
    label: 'Gallery',
  },
  {
    icon: ToolsIcon,
    route: '/tools',
    label: 'Tools',
  },
]
