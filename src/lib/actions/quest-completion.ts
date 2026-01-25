'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ClaimQuestResult = {
  success: boolean
  status?: 'completed' | 'awaiting_final_approval'
  pointsAwarded?: number
  message?: string
  error?: string
}

export type GMReviewResult = {
  success: boolean
  status?: 'completed' | 'rejected_to_claimable'
  pointsAwarded?: number
  feedback?: string
  error?: string
}

export interface PendingQuestApproval {
  id: string
  user_id: string
  quest_id: string
  quest_title: string
  quest_points: number
  user_display_name: string | null
  user_email: string
  ready_to_claim_at: string
}

/**
 * Claim reward for a completed quest
 * Called by user when all objectives are approved
 */
export async function claimQuestReward(userQuestId: string): Promise<ClaimQuestResult> {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Call the database function
  // Type assertion needed as rpc functions may not be in generated types yet
  const { data, error } = await (supabase as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
  }).rpc('claim_quest_reward', {
    p_user_quest_id: userQuestId,
  })

  if (error) {
    console.error('Error claiming quest reward:', error)
    return { success: false, error: error.message }
  }

  const result = data as { status?: string; points_awarded?: number; message?: string; error?: string }

  if (result.error) {
    return { success: false, error: result.error }
  }

  // Revalidate relevant paths
  revalidatePath('/my-quests')
  revalidatePath(`/my-quests/${userQuestId}`)
  revalidatePath('/dashboard')
  revalidatePath('/leaderboard')

  return {
    success: true,
    status: result.status as 'completed' | 'awaiting_final_approval',
    pointsAwarded: result.points_awarded,
    message: result.message,
  }
}

/**
 * GM reviews quest completion (approve or reject)
 */
export async function gmReviewQuestCompletion(
  userQuestId: string,
  approved: boolean,
  feedback?: string
): Promise<GMReviewResult> {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Call the database function
  // Type assertion needed as rpc functions may not be in generated types yet
  const { data, error } = await (supabase as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
  }).rpc('gm_review_quest_completion', {
    p_user_quest_id: userQuestId,
    p_approved: approved,
    p_feedback: feedback || null,
  })

  if (error) {
    console.error('Error reviewing quest completion:', error)
    return { success: false, error: error.message }
  }

  const result = data as { status?: string; points_awarded?: number; feedback?: string; error?: string }

  if (result.error) {
    return { success: false, error: result.error }
  }

  // Revalidate relevant paths
  revalidatePath('/gm/review')
  revalidatePath('/gm/quests')

  return {
    success: true,
    status: result.status as 'completed' | 'rejected_to_claimable',
    pointsAwarded: result.points_awarded,
    feedback: result.feedback,
  }
}

/**
 * Get pending quest approvals for GM review
 */
export async function getPendingQuestApprovals(): Promise<PendingQuestApproval[]> {
  const supabase = await createClient()

  // Type assertion needed as rpc functions may not be in generated types yet
  const { data, error } = await (supabase as unknown as {
    rpc: (fn: string) => Promise<{ data: unknown; error: Error | null }>
  }).rpc('get_pending_quest_approvals')

  if (error) {
    console.error('Error fetching pending quest approvals:', error)
    return []
  }

  return (data || []) as PendingQuestApproval[]
}
