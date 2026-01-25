'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { evidenceSchema } from '@/lib/schemas/evidence.schema'

export type EvidenceActionResult = {
  success: boolean
  error?: string
}

export interface PendingSubmissionData {
  id: string
  objective_id: string
  user_quest_id: string
  status: string
  evidence_text: string | null
  evidence_url: string | null
  submitted_at: string | null
  reviewed_at: string | null
  feedback: string | null
  created_at: string
  updated_at: string
  user_quest: {
    id: string
    user_id: string
    quest_id: string
    status: string
    user: {
      id: string
      display_name: string | null
      email: string
      total_points: number
    } | null
    quest: {
      id: string
      title: string
      points: number
    } | null
  }
  objective: {
    id: string
    title: string
    description: string | null
    points: number
    evidence_type: string
  } | null
}

// Type definitions for query results
interface UserObjectiveQueryResult {
  id: string
  objective_id: string
  user_quest_id: string
  status: string
  evidence_text: string | null
  evidence_url: string | null
  submitted_at: string | null
  reviewed_at: string | null
  feedback: string | null
  created_at: string
  updated_at: string
}

interface UserQuestQueryResult {
  id: string
  user_id: string
  quest_id: string
  status: string
  users: { id: string; display_name: string | null; email: string; total_points: number } | null
  quests: { id: string; title: string; points: number } | null
}

interface ObjectiveQueryResult {
  id: string
  title: string
  description: string | null
  points: number
  evidence_type: string
}

/**
 * Fetch pending evidence submissions for GM review
 * Uses authenticated server client - RLS policy allows GMs to see all submissions
 */
export async function getPendingSubmissions(questId?: string): Promise<PendingSubmissionData[]> {
  const supabase = await createClient()

  // First, get all submitted user_objectives
  const { data: rawUserObjectives, error: objError } = await supabase
    .from('user_objectives')
    .select('*')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })

  if (objError) {
    console.error('Error fetching user_objectives:', objError)
    return []
  }

  const userObjectives = (rawUserObjectives || []) as unknown as UserObjectiveQueryResult[]

  if (userObjectives.length === 0) {
    return []
  }

  // Get unique user_quest_ids and objective_ids
  const userQuestIds = [...new Set(userObjectives.map(o => o.user_quest_id))]
  const objectiveIds = [...new Set(userObjectives.map(o => o.objective_id))]

  // Fetch user_quests with users and quests
  const { data: rawUserQuests, error: uqError } = await supabase
    .from('user_quests')
    .select(`
      id,
      user_id,
      quest_id,
      status,
      users (
        id,
        display_name,
        email,
        total_points
      ),
      quests (
        id,
        title,
        points
      )
    `)
    .in('id', userQuestIds)

  if (uqError) {
    console.error('Error fetching user_quests:', uqError)
    return []
  }

  const userQuests = (rawUserQuests || []) as unknown as UserQuestQueryResult[]

  // Fetch objectives
  const { data: rawObjectives, error: objDefError } = await supabase
    .from('objectives')
    .select('id, title, description, points, evidence_type')
    .in('id', objectiveIds)

  if (objDefError) {
    console.error('Error fetching objectives:', objDefError)
    return []
  }

  const objectives = (rawObjectives || []) as unknown as ObjectiveQueryResult[]

  // Build lookup maps
  const userQuestMap = new Map(userQuests.map(uq => [uq.id, uq]))
  const objectiveMap = new Map(objectives.map(o => [o.id, o]))

  // Filter by questId if provided
  let filteredObjectives = userObjectives
  if (questId) {
    filteredObjectives = userObjectives.filter(uo => {
      const uq = userQuestMap.get(uo.user_quest_id)
      return uq?.quest_id === questId
    })
  }

  // Transform the data
  return filteredObjectives.map((item) => {
    const userQuestData = userQuestMap.get(item.user_quest_id)
    const objectiveData = objectiveMap.get(item.objective_id)

    return {
      id: item.id,
      objective_id: item.objective_id,
      user_quest_id: item.user_quest_id,
      status: item.status,
      evidence_text: item.evidence_text,
      evidence_url: item.evidence_url,
      submitted_at: item.submitted_at,
      reviewed_at: item.reviewed_at,
      feedback: item.feedback,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_quest: userQuestData ? {
        id: userQuestData.id,
        user_id: userQuestData.user_id,
        quest_id: userQuestData.quest_id,
        status: userQuestData.status,
        user: userQuestData.users,
        quest: userQuestData.quests,
      } : {
        id: '',
        user_id: '',
        quest_id: '',
        status: '',
        user: null,
        quest: null,
      },
      objective: objectiveData ? {
        id: objectiveData.id,
        title: objectiveData.title,
        description: objectiveData.description,
        points: objectiveData.points,
        evidence_type: objectiveData.evidence_type,
      } : null,
    }
  })
}

/**
 * Submit evidence for a user objective
 * This server action handles validation and database update
 */
export async function submitEvidenceAction(
  userObjectiveId: string,
  evidenceText?: string,
  evidenceUrl?: string
): Promise<EvidenceActionResult> {
  // Validate input
  const validation = evidenceSchema.safeParse({
    userObjectiveId,
    evidenceText,
    evidenceUrl,
  })

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Invalid evidence data',
    }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify the user owns this objective
  // Type for query result (Supabase type inference doesn't handle joins well)
  type UserObjectiveResult = {
    id: string
    status: string
    user_quests: { user_id: string }
  }

  const { data: rawData, error: fetchError } = await supabase
    .from('user_objectives')
    .select(`
      id,
      status,
      user_quests!inner (
        user_id
      )
    `)
    .eq('id', userObjectiveId)
    .single()

  if (fetchError || !rawData) {
    return { success: false, error: 'Objective not found' }
  }

  const userObjective = rawData as unknown as UserObjectiveResult

  // Check if user owns this objective
  if (userObjective.user_quests.user_id !== user.id) {
    return { success: false, error: 'You do not have permission to submit evidence for this objective' }
  }

  // Check if objective is in a valid state for submission
  if (userObjective.status !== 'available') {
    return {
      success: false,
      error: userObjective.status === 'locked'
        ? 'This objective is locked. Complete the prerequisite objectives first.'
        : 'Evidence has already been submitted for this objective',
    }
  }

  // Update the objective with evidence
  const updateData: {
    status: 'submitted'
    evidence_text?: string | null
    evidence_url?: string | null
    submitted_at: string
  } = {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }

  if (evidenceText) {
    updateData.evidence_text = evidenceText
  }

  if (evidenceUrl) {
    updateData.evidence_url = evidenceUrl
  }

  // Use type assertion to bypass Supabase type inference issues
  const { error: updateError } = await (supabase
    .from('user_objectives') as ReturnType<typeof supabase.from>)
    .update(updateData as Record<string, unknown>)
    .eq('id', userObjectiveId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
