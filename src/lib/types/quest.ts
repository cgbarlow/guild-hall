import type { Database } from '@/lib/types/database'

// Base quest type from database
export type QuestRow = Database['public']['Tables']['quests']['Row']

// Quest status types
export type QuestStatus = 'draft' | 'published' | 'open' | 'in_progress' | 'completed' | 'claimed' | 'submitted' | 'approved' | 'rejected'

// Category type for organizing quests
export interface Category {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  created_at: string
}

// Objective type for quest tasks
export interface Objective {
  id: string
  quest_id: string
  description: string
  is_completed: boolean
  order: number
  created_at: string
}

// Extended quest type with additional fields for display
export interface Quest {
  id: string
  guild_id: string
  title: string
  description: string | null
  short_description?: string | null
  status: QuestStatus
  points: number
  xp_reward: number
  time_limit_days: number | null
  deadline: string | null
  category_id: string | null
  category?: Category | null
  created_by: string
  claimed_by: string | null
  created_at: string
  updated_at: string
  objectives?: Objective[]
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
  }
  return statusMap[dbStatus] || 'open'
}

// Get display label for status
export function getStatusLabel(status: QuestStatus): string {
  const labels: Record<QuestStatus, string> = {
    draft: 'Draft',
    published: 'Published',
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
