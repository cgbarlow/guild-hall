import { Sprout, TreeDeciduous, Trees, Mountain, Crown, Swords, type LucideIcon } from 'lucide-react'

/**
 * Mapping of tier icon names to Lucide icon components
 * Used across profile, leaderboard, and dashboard components
 */
export const TIER_ICONS: Record<string, LucideIcon> = {
  Sprout,
  TreeDeciduous,
  Trees,
  Mountain,
  Crown,
  Swords,
}

/**
 * Get a tier icon component by name (case-insensitive)
 * Falls back to Swords if icon not found
 */
export function getTierIcon(iconName: string): LucideIcon {
  // Try exact match first, then case-insensitive
  return TIER_ICONS[iconName] || TIER_ICONS[
    Object.keys(TIER_ICONS).find(key => key.toLowerCase() === iconName.toLowerCase()) || ''
  ] || Swords
}
