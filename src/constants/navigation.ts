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
  isOnBottomBar?: boolean
}

export const sidebarLinks: NavigationItem[] = [
  {
    icon: Home01Icon,
    route: '/',
    label: 'Home',
    isPrivate: true,
    isOnBottomBar: true,
  },
  {
    icon: MapsSearchIcon,
    route: '/explore',
    label: 'Explore',
    isPrivate: true,
    isOnBottomBar: true,
  },
  {
    icon: UserGroupIcon,
    route: '/users',
    label: 'People',
    isOnBottomBar: true,
  },
  {
    icon: Image01Icon,
    route: '/gallery',
    label: 'Gallery',
    isOnBottomBar: true,
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
    isOnBottomBar: true,
  },
]
