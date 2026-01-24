import type { Database } from '@/lib/types/database'

// Base quest type from database
export type QuestRow = Database['public']['Tables']['quests']['Row']

// Quest status types (from database schema - for GM management)
export type QuestDbStatus = 'draft' | 'published' | 'archived'

// User quest status types (from user_quests table)
export type UserQuestStatus = 'accepted' | 'in_progress' | 'completed' | 'abandoned' | 'expired'

// Combined status for UI display
export type QuestStatus = 'draft' | 'published' | 'archived' | 'open' | 'in_progress' | 'completed' | 'claimed' | 'submitted' | 'approved' | 'rejected'

// Category type from database
export type CategoryRow = Database['public']['Tables']['categories']['Row']

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color?: string
  display_order: number
  created_at: string
}

// Objective type from database
export type ObjectiveRow = Database['public']['Tables']['objectives']['Row']

export interface Objective {
  id: string
  quest_id: string
  title: string
  description: string | null
  points: number
  display_order: number
  depends_on_id: string | null
  evidence_required: boolean
  evidence_type: 'none' | 'text' | 'link' | 'text_or_link'
  created_at: string
  updated_at: string
}

// Extended quest type with additional fields for display
export interface Quest {
  id: string
  title: string
  description: string | null
  short_description?: string | null
  status: QuestStatus
  points: number
  xp_reward: number
  time_limit_days: number | null
  completion_days: number | null
  deadline: string | null
  acceptance_deadline: string | null
  category_id: string | null
  category?: Category | null
  is_template: boolean
  template_id: string | null
  narrative_context: string | null
  transformation_goal: string | null
  reward_description: string | null
  created_by: string
  created_at: string
  updated_at: string
  published_at: string | null
  archived_at: string | null
  objectives?: Objective[]
  // Legacy fields for backward compatibility
  guild_id?: string
  claimed_by?: string | null
}

// Quest with relations loaded
export interface QuestWithRelations extends Quest {
  category: Category | null
  objectives: Objective[]
}

// Filter options for quest listing
export interface QuestFilters {
  category_id?: string | null
  status?: QuestStatus | QuestStatus[]
  search?: string
  is_template?: boolean
}

// GM-specific quest filters
export interface GMQuestFilters extends QuestFilters {
  created_by?: string
}

// Quest list response
export interface QuestListResponse {
  quests: Quest[]
  total: number
  page: number
  pageSize: number
}

// Map database status to display status
export function mapQuestStatus(dbStatus: string): QuestStatus {
  const statusMap: Record<string, QuestStatus> = {
    'open': 'open',
    'claimed': 'in_progress',
    'submitted': 'in_progress',
    'approved': 'completed',
    'rejected': 'open',
    'draft': 'draft',
    'published': 'published',
    'archived': 'archived',
  }
  return statusMap[dbStatus] || 'open'
}

// Get display label for status
export function getStatusLabel(status: QuestStatus): string {
  const labels: Record<QuestStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    claimed: 'Claimed',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return labels[status] || status
}

// Get status color for badges
export function getStatusColor(status: QuestStatus): string {
  const colors: Record<QuestStatus, string> = {
    draft: 'bg-slate-100 text-slate-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    claimed: 'bg-purple-100 text-purple-800',
    submitted: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
