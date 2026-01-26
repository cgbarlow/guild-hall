'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { evidenceSchema } from '@/lib/schemas/evidence.schema'

// Debug flag - set to true to enable console logging
const DEBUG_REVIEW_QUEUE = true

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
  reviewed_by: string | null
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
  reviewed_by: string | null
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

export type ReviewStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

/**
 * Fetch evidence submissions for GM review
 * Uses service client after verifying GM status to bypass RLS
 */
export async function getPendingSubmissions(
  questId?: string,
  statusFilter: ReviewStatusFilter = 'pending'
): Promise<PendingSubmissionData[]> {
  // First verify user is authenticated and is GM using auth client
  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()

  if (!currentUser) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] No authenticated user')
    return []
  }

  if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] Current user:', currentUser.id, currentUser.email)

  // Check if user is GM
  const { data: userRoles, error: roleError } = await authClient
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)

  if (roleError) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] Error fetching roles:', roleError)
    return []
  }

  const roles = userRoles as { role: string }[] | null
  const isGm = roles?.some(r => r.role === 'gm' || r.role === 'admin')

  if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] User roles:', roles, 'Is GM:', isGm)

  if (!isGm) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] User is not GM, returning empty')
    return []
  }

  // Use service client to bypass RLS for GM operations
  const supabase = createServiceClient()

  // Build query based on status filter
  let query = supabase
    .from('user_objectives')
    .select('*')

  if (statusFilter === 'pending') {
    query = query.eq('status', 'submitted')
  } else if (statusFilter === 'approved') {
    query = query.eq('status', 'approved')
  } else if (statusFilter === 'rejected') {
    query = query.eq('status', 'rejected')
  } else {
    // 'all' - get submitted, approved, and rejected
    query = query.in('status', ['submitted', 'approved', 'rejected'])
  }

  const { data: rawUserObjectives, error: objError } = await query
    .order('submitted_at', { ascending: true, nullsFirst: false })

  if (objError) {
    console.error('[getPendingSubmissions] Error fetching user_objectives:', objError)
    return []
  }

  if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] Found user_objectives:', rawUserObjectives?.length || 0)

  const userObjectives = (rawUserObjectives || []) as unknown as UserObjectiveQueryResult[]

  if (userObjectives.length === 0) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getPendingSubmissions] No submitted objectives found')
    return []
  }

  // Get unique user_quest_ids and objective_ids
  const userQuestIds = [...new Set(userObjectives.map(o => o.user_quest_id))]
  const objectiveIds = [...new Set(userObjectives.map(o => o.objective_id))]

  // Fetch user_quests with users and quests
  // Use explicit FK reference for users since there are multiple FKs (user_id, extension_decided_by, final_reviewed_by)
  const { data: rawUserQuests, error: uqError } = await supabase
    .from('user_quests')
    .select(`
      id,
      user_id,
      quest_id,
      status,
      users!user_quests_user_id_fkey (
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
      reviewed_by: item.reviewed_by,
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
/**
 * Fetch objective counts for a user quest (for GM review context)
 * Uses service client after verifying GM status to bypass RLS
 */
export async function getObjectiveCounts(userQuestId: string): Promise<{
  total: number
  completed: number
}> {
  // First verify user is authenticated and is GM using auth client
  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()

  if (!currentUser) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getObjectiveCounts] No authenticated user')
    return { total: 0, completed: 0 }
  }

  // Check if user is GM
  const { data: userRoles, error: roleError } = await authClient
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)

  if (roleError) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getObjectiveCounts] Error fetching roles:', roleError)
    return { total: 0, completed: 0 }
  }

  const roles = userRoles as { role: string }[] | null
  const isGm = roles?.some(r => r.role === 'gm' || r.role === 'admin')

  if (!isGm) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getObjectiveCounts] User is not GM')
    return { total: 0, completed: 0 }
  }

  // Use service client to bypass RLS for GM operations
  const supabase = createServiceClient()

  const { data: rawData, error } = await supabase
    .from('user_objectives')
    .select('id, status')
    .eq('user_quest_id', userQuestId)

  if (error) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getObjectiveCounts] Error fetching objectives:', error)
    return { total: 0, completed: 0 }
  }

  const data = (rawData || []) as { id: string; status: string }[]
  const total = data.length
  const completed = data.filter((o) => o.status === 'approved').length

  return { total, completed }
}

/**
 * Fetch a single submission with full details for GM review
 * Uses service client after verifying GM status to bypass RLS
 */
export async function getSubmissionById(id: string): Promise<PendingSubmissionData | null> {
  // First verify user is authenticated and is GM using auth client
  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()

  if (!currentUser) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] No authenticated user')
    return null
  }

  // Check if user is GM
  const { data: userRoles, error: roleError } = await authClient
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)

  if (roleError) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] Error fetching roles:', roleError)
    return null
  }

  const roles = userRoles as { role: string }[] | null
  const isGm = roles?.some(r => r.role === 'gm' || r.role === 'admin')

  if (!isGm) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] User is not GM')
    return null
  }

  // Use service client to bypass RLS for GM operations
  const supabase = createServiceClient()

  // Fetch the user_objective
  const { data: rawUserObjective, error: objError } = await supabase
    .from('user_objectives')
    .select('*')
    .eq('id', id)
    .single()

  if (objError) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] Error fetching user_objective:', objError)
    return null
  }

  if (!rawUserObjective) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] No user_objective found for id:', id)
    return null
  }

  const userObjective = rawUserObjective as unknown as UserObjectiveQueryResult

  // Fetch user_quest with user and quest
  // Use explicit FK reference for users since there are multiple FKs (user_id, extension_decided_by, final_reviewed_by)
  const { data: rawUserQuest, error: uqError } = await supabase
    .from('user_quests')
    .select(`
      id,
      user_id,
      quest_id,
      status,
      users!user_quests_user_id_fkey (
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
    .eq('id', userObjective.user_quest_id)
    .single()

  if (uqError) {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] Error fetching user_quest:', uqError)
    return null
  }

  const userQuest = rawUserQuest as unknown as UserQuestQueryResult

  // Fetch objective
  const { data: rawObjective, error: objDefError } = await supabase
    .from('objectives')
    .select('id, title, description, points, evidence_type')
    .eq('id', userObjective.objective_id)
    .single()

  if (objDefError && objDefError.code !== 'PGRST116') {
    if (DEBUG_REVIEW_QUEUE) console.log('[getSubmissionById] Error fetching objective:', objDefError)
    return null
  }

  const objective = rawObjective as unknown as ObjectiveQueryResult | null

  // Transform and return
  return {
    id: userObjective.id,
    objective_id: userObjective.objective_id,
    user_quest_id: userObjective.user_quest_id,
    status: userObjective.status,
    evidence_text: userObjective.evidence_text,
    evidence_url: userObjective.evidence_url,
    submitted_at: userObjective.submitted_at,
    reviewed_by: userObjective.reviewed_by,
    reviewed_at: userObjective.reviewed_at,
    feedback: userObjective.feedback,
    created_at: userObjective.created_at,
    updated_at: userObjective.updated_at,
    user_quest: userQuest ? {
      id: userQuest.id,
      user_id: userQuest.user_id,
      quest_id: userQuest.quest_id,
      status: userQuest.status,
      user: userQuest.users,
      quest: userQuest.quests,
    } : {
      id: '',
      user_id: '',
      quest_id: '',
      status: '',
      user: null,
      quest: null,
    },
    objective: objective ? {
      id: objective.id,
      title: objective.title,
      description: objective.description,
      points: objective.points,
      evidence_type: objective.evidence_type,
    } : null,
  }
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
