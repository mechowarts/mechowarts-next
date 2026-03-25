import type { IconSvgElement } from '@hugeicons/react'

export interface NavigationItem {
  icon: IconSvgElement
  route: string
  label: string
  isPrivate?: boolean
}
