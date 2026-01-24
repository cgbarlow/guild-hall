import {
  Sword,
  Compass,
  Backpack,
  ScrollText,
  Shield,
  Wand2,
  Users,
  Map,
  Trophy,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryIconProps {
  icon: string
  className?: string
}

// Map icon names to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  sword: Sword,
  compass: Compass,
  backpack: Backpack,
  scroll: ScrollText,
  shield: Shield,
  wand: Wand2,
  users: Users,
  map: Map,
  trophy: Trophy,
  star: Star,
}

export function CategoryIcon({ icon, className }: CategoryIconProps) {
  const IconComponent = iconMap[icon.toLowerCase()] || Star

  return <IconComponent className={cn('h-4 w-4', className)} />
}

// Export available icons for reference
export const availableCategoryIcons = Object.keys(iconMap)
