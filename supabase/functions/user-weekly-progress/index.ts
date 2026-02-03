// User Weekly Progress Edge Function
// Sends weekly progress email to users with activity summary, recommendations, and encouragement
// ADR: ADR-012-Engagement-Improvements, SPEC-012-F

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

import {
  emailWrapper,
  formatShortDate,
  getWeekRange,
  escapeHtml,
  sendEmailViaMailjet,
} from '../_shared/email-templates.ts'
import {
  getRecommendedAction,
  NudgeContext,
  NudgeBannerData,
} from '../_shared/nudge-priority.ts'

// Types
interface UserPreference {
  user_id: string
  enabled: boolean
  day_of_week: number
  send_time: string
  timezone: string
  last_sent_at: string | null
  users: {
    id: string
    email: string
    display_name: string
    total_points: number
  }
}

interface NextStep {
  questTitle: string
  objectiveTitle: string
  questProgress: string
}

interface WeeklyProgress {
  objectivesSubmitted: number
  objectivesApproved: number
  questsCompleted: number
  pointsEarned: number
  currentStreak: number
}

interface TierProgress {
  currentTier: string
  pointsToNext: number
  nextTier: string | null
  progressPercent: number
}

interface UnclaimedBadge {
  questTitle: string
  questId: string
}

interface UserEmailData {
  displayName: string
  nextSteps: NextStep[]
  recommendedAction: NudgeBannerData | null
  progress: WeeklyProgress
  tierProgress: TierProgress
  encouragementMessage: string
  weekRange: { start: string; end: string }
  unclaimedBadges: UnclaimedBadge[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Get tier information for a user based on points
 */
async function getTierInfo(
  supabase: SupabaseClient,
  points: number
): Promise<TierProgress> {
  const { data: tiers } = await supabase
    .from('skill_tier_config')
    .select('*')
    .order('min_points', { ascending: false })

  if (!tiers || tiers.length === 0) {
    return {
      currentTier: 'Apprentice',
      pointsToNext: 300,
      nextTier: 'Journeyman',
      progressPercent: Math.min(100, (points / 300) * 100),
    }
  }

  // Find current tier (highest tier where points >= min_points)
  let currentTier = tiers[tiers.length - 1] // Default to lowest tier
  let nextTier = null

  for (let i = 0; i < tiers.length; i++) {
    if (points >= tiers[i].min_points) {
      currentTier = tiers[i]
      nextTier = i > 0 ? tiers[i - 1] : null
      break
    }
  }

  const pointsToNext = nextTier ? nextTier.min_points - points : 0
  const progressPercent = nextTier
    ? Math.min(
        100,
        ((points - currentTier.min_points) /
          (nextTier.min_points - currentTier.min_points)) *
          100
      )
    : 100

  return {
    currentTier: currentTier.name,
    pointsToNext,
    nextTier: nextTier?.name || null,
    progressPercent: Math.round(progressPercent),
  }
}

/**
 * Gather user data for weekly email
 */
async function gatherUserData(
  supabase: SupabaseClient,
  userId: string,
  userPoints: number
): Promise<Omit<UserEmailData, 'displayName' | 'weekRange'>> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const nextSteps: NextStep[] = []
  let approvedObjectivesCount = 0

  // Get next steps (approved objectives with available next objectives)
  try {
    const { data: approvedData, error: approvedError } = await supabase
      .from('user_objectives')
      .select(`
        objectives!inner(title),
        user_quests!inner(
          id,
          status,
          user_id,
          quests!inner(id, title)
        )
      `)
      .eq('status', 'approved')
      .eq('user_quests.user_id', userId)
      .in('user_quests.status', ['accepted', 'in_progress'])
      .limit(5)

    if (approvedError) {
      console.error('[gatherUserData] Error fetching approved data:', approvedError)
    }

    for (const item of approvedData || []) {
      try {
        const userQuest = item.user_quests as Record<string, unknown>
        const quest = userQuest?.quests as Record<string, unknown>
        const objective = item.objectives as Record<string, unknown>

        if (!userQuest?.id || !quest?.id) continue

        // Check if there are available objectives to continue
        const { count: availableCount } = await supabase
          .from('user_objectives')
          .select('*', { count: 'exact', head: true })
          .eq('user_quest_id', userQuest.id as string)
          .eq('status', 'available')

        if (availableCount && availableCount > 0) {
          // Get progress
          const { count: approvedCount } = await supabase
            .from('user_objectives')
            .select('*', { count: 'exact', head: true })
            .eq('user_quest_id', userQuest.id as string)
            .eq('status', 'approved')

          const { count: totalCount } = await supabase
            .from('objectives')
            .select('*', { count: 'exact', head: true })
            .eq('quest_id', quest.id as string)

          nextSteps.push({
            questTitle: (quest.title as string) || 'Quest',
            objectiveTitle: (objective?.title as string) || 'Objective',
            questProgress: `${approvedCount || 0}/${totalCount || 0} objectives`,
          })
        }
      } catch (itemError) {
        console.error('[gatherUserData] Error processing item:', itemError)
      }
    }
  } catch (nextStepsError) {
    console.error('[gatherUserData] Error in next steps:', nextStepsError)
  }

  // Count approved objectives for nudge context
  try {
    // First get the user's active quest IDs
    const { data: userQuestIds } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['accepted', 'in_progress'])

    const questIds = userQuestIds?.map((q) => q.id) || []

    if (questIds.length > 0) {
      const { count } = await supabase
        .from('user_objectives')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .in('user_quest_id', questIds)

      approvedObjectivesCount = count || 0
    }
  } catch (countError) {
    console.error('[gatherUserData] Error counting approved objectives:', countError)
  }

  // Initialize defaults
  let upcomingDeadlines: Array<{ quest_id: string; quest_title: string; days_remaining: number }> = []
  let activeQuestsCount = 0
  let recommendedQuest: { id: string; title: string } | null = null
  let recommendedAction: NudgeBannerData | null = null
  const progress: WeeklyProgress = {
    objectivesSubmitted: 0,
    objectivesApproved: 0,
    questsCompleted: 0,
    pointsEarned: 0,
    currentStreak: 0,
  }

  // Get upcoming deadlines
  try {
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const { data: deadlineData } = await supabase
      .from('user_quests')
      .select(`
        deadline,
        extended_deadline,
        quest_id,
        quests!inner(title)
      `)
      .eq('user_id', userId)
      .in('status', ['accepted', 'in_progress'])
      .not('deadline', 'is', null)
      .lte('deadline', sevenDaysFromNow.toISOString())
      .gte('deadline', now.toISOString())
      .order('deadline', { ascending: true })

    upcomingDeadlines = (deadlineData || []).map((item) => {
      const quest = item.quests as Record<string, unknown>
      const effectiveDeadline = item.extended_deadline || item.deadline
      const deadlineDate = new Date(effectiveDeadline as string)
      const daysRemaining = Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        quest_id: item.quest_id,
        quest_title: (quest?.title as string) || 'Quest',
        days_remaining: daysRemaining,
      }
    })
  } catch (deadlineError) {
    console.error('[gatherUserData] Error fetching deadlines:', deadlineError)
  }

  // Get active quests count
  try {
    const { count } = await supabase
      .from('user_quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['accepted', 'in_progress'])

    activeQuestsCount = count || 0
  } catch (activeError) {
    console.error('[gatherUserData] Error counting active quests:', activeError)
  }

  // Get recommended quest if no active quests
  try {
    if (activeQuestsCount === 0) {
      const { data: questData } = await supabase
        .from('quests')
        .select('id, title')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(1)

      if (questData && questData.length > 0) {
        recommendedQuest = {
          id: questData[0].id,
          title: questData[0].title,
        }
      }
    }
  } catch (recommendError) {
    console.error('[gatherUserData] Error fetching recommended quest:', recommendError)
  }

  // Build nudge context for recommended action
  try {
    const nudgeContext: NudgeContext = {
      approvedObjectivesCount: approvedObjectivesCount || 0,
      upcomingDeadlines,
      activeQuestsCount: activeQuestsCount || 0,
      recommendedQuest,
      recentMilestone: null, // Not used in email
    }

    recommendedAction = getRecommendedAction(nudgeContext)
  } catch (nudgeError) {
    console.error('[gatherUserData] Error getting recommended action:', nudgeError)
  }

  // Weekly progress stats
  try {
    const { data: weeklyActivities } = await supabase
      .from('activities')
      .select('type, points_earned')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())

    for (const activity of weeklyActivities || []) {
      progress.pointsEarned += activity.points_earned || 0

      switch (activity.type) {
        case 'objective_completed':
          progress.objectivesApproved++
          break
        case 'quest_completed':
          progress.questsCompleted++
          break
      }
    }
  } catch (activityError) {
    console.error('[gatherUserData] Error fetching activities:', activityError)
  }

  // Count submitted objectives this week
  try {
    const { data: userQuestIds } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', userId)

    const questIds = userQuestIds?.map((q) => q.id) || []

    if (questIds.length > 0) {
      const { count: submittedCount } = await supabase
        .from('user_objectives')
        .select('*', { count: 'exact', head: true })
        .in('user_quest_id', questIds)
        .gte('submitted_at', weekAgo.toISOString())

      progress.objectivesSubmitted = submittedCount || 0
    }
  } catch (submittedError) {
    console.error('[gatherUserData] Error counting submitted objectives:', submittedError)
  }

  // Get streak
  try {
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .maybeSingle()

    progress.currentStreak = streakData?.current_streak || 0
  } catch (streakError) {
    console.error('[gatherUserData] Error fetching streak:', streakError)
  }

  // Get tier progress
  let tierProgress: TierProgress = {
    currentTier: 'Apprentice',
    pointsToNext: 300,
    nextTier: 'Journeyman',
    progressPercent: Math.min(100, (userPoints / 300) * 100),
  }

  try {
    tierProgress = await getTierInfo(supabase, userPoints)
  } catch (tierError) {
    console.error('[gatherUserData] Error fetching tier info:', tierError)
  }

  // Generate encouragement message
  const encouragementMessage = generateEncouragementMessage(
    progress,
    tierProgress
  )

  // Get unclaimed badges (completed quests with badges that haven't been claimed)
  let unclaimedBadges: UnclaimedBadge[] = []
  try {
    // Find completed quests with badges that haven't been claimed yet
    const { data: completedQuests } = await supabase
      .from('user_quests')
      .select(`
        quest_id,
        badge_claimed,
        quests!inner(id, title, badge_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('badge_claimed', false)
      .not('quests.badge_url', 'is', null)
      .limit(5)

    unclaimedBadges = (completedQuests || [])
      .map((item) => {
        const quest = item.quests as Record<string, unknown>
        return {
          questTitle: (quest?.title as string) || 'Quest',
          questId: (quest?.id as string) || item.quest_id,
        }
      })
      .filter((badge) => badge.questId)
  } catch (badgeError) {
    console.error('[gatherUserData] Error fetching unclaimed badges:', badgeError)
  }

  return {
    nextSteps,
    recommendedAction,
    progress,
    tierProgress,
    encouragementMessage,
    unclaimedBadges,
  }
}

/**
 * Generate personalized encouragement message
 */
function generateEncouragementMessage(
  progress: WeeklyProgress,
  tierProgress: TierProgress
): string {
  // Priority order for encouragement

  // Streak celebration
  if (progress.currentStreak >= 7) {
    return `Amazing! You're on a ${progress.currentStreak} day streak and counting!`
  }

  // Quest completion
  if (progress.questsCompleted > 0) {
    return `Congratulations on completing ${progress.questsCompleted} quest${progress.questsCompleted > 1 ? 's' : ''} this week!`
  }

  // Tier progress
  if (tierProgress.nextTier && tierProgress.progressPercent > 50) {
    return `You're over halfway to ${tierProgress.nextTier}! Keep up the great work.`
  }

  // Points earned
  if (progress.pointsEarned > 0) {
    return `Great work! You earned ${progress.pointsEarned} points this week.`
  }

  // No activity
  return "Ready to jump back in? The guild awaits your return!"
}

/**
 * Render the weekly progress email HTML
 */
function renderWeeklyEmail(data: UserEmailData, baseUrl: string): string {
  const {
    displayName,
    nextSteps,
    recommendedAction,
    progress,
    tierProgress,
    encouragementMessage,
    weekRange,
    unclaimedBadges,
  } = data

  let content = `
    <div class="header">
      <h1>Your Weekly Progress</h1>
      <p>Week of ${weekRange.start} - ${weekRange.end}</p>
    </div>

    <!-- Greeting -->
    <div class="card">
      <p style="font-size: 18px; margin: 0;">Kia ora, ${escapeHtml(displayName)}!</p>
      <p style="margin: 12px 0 0 0;">${escapeHtml(encouragementMessage)}</p>
    </div>`

  // Recommended Action
  if (recommendedAction) {
    content += `
    <div class="card">
      <p class="section-title">Recommended Action</p>
      <div class="info-card">
        <h3>${escapeHtml(recommendedAction.message)}</h3>
        <a href="${baseUrl}${recommendedAction.actionUrl}" class="button">
          ${escapeHtml(recommendedAction.actionLabel)}
        </a>
      </div>
    </div>`
  }

  // Unclaimed Badges
  if (unclaimedBadges && unclaimedBadges.length > 0) {
    content += `
    <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b;">
      <p class="section-title" style="color: #92400e;">&#127942; Badges Ready to Claim</p>
      <p style="color: #78350f; margin-bottom: 12px;">You've earned badges that are waiting to be claimed!</p>
      ${unclaimedBadges.map((badge) => `
        <div class="list-item" style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
          <strong style="color: #92400e;">${escapeHtml(badge.questTitle)}</strong>
        </div>
      `).join('')}
      <a href="${baseUrl}/my-quests" class="button" style="background: #f59e0b;">Claim Your Badges</a>
    </div>`
  }

  // Next Steps
  if (nextSteps.length > 0) {
    content += `
    <div class="card">
      <p class="section-title">Ready to Continue</p>
      ${nextSteps.map((step) => `
        <div class="list-item">
          <strong>${escapeHtml(step.questTitle)}</strong>
          <br>
          <span class="muted">${escapeHtml(step.objectiveTitle)} (${step.questProgress})</span>
        </div>
      `).join('')}
      <a href="${baseUrl}/my-quests" class="button">View Active Quests</a>
    </div>`
  }

  // Weekly Stats - simplified to show what matters to users
  content += `
    <div class="card">
      <p class="section-title">This Week's Progress</p>
      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-value">${progress.objectivesApproved}</div>
          <div class="stat-label">Objectives Completed</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${progress.questsCompleted}</div>
          <div class="stat-label">Quests Completed</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">+${progress.pointsEarned}</div>
          <div class="stat-label">Points Earned</div>
        </div>
      </div>
    </div>`

  // Tier Progress
  if (tierProgress.nextTier) {
    content += `
    <div class="card">
      <p class="section-title">Tier Progress</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="tier-badge">${tierProgress.currentTier}</span>
          <span class="muted">${tierProgress.pointsToNext} pts to ${tierProgress.nextTier}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${tierProgress.progressPercent}%"></div>
        </div>
      </div>
    </div>`
  }

  // Streak
  if (progress.currentStreak > 0) {
    content += `
    <div class="encouragement">
      <span style="font-size: 32px;">&#128293;</span>
      <p style="margin: 8px 0 0 0; font-weight: 600;">${progress.currentStreak} Day Streak!</p>
    </div>`
  }

  return emailWrapper(content, 'Guild Hall - Your Weekly Progress').replace(
    /\{\{baseUrl\}\}/g,
    baseUrl
  )
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Weekly Progress] Starting function execution...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const mailjetApiKey = Deno.env.get('MAILJET_API_KEY')
    const mailjetSecretKey = Deno.env.get('MAILJET_SECRET_KEY')
    const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'agentics@cgee.nz'
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://guild-hall.agentics.nz'

    console.log('[Weekly Progress] Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasMailjetKey: !!mailjetApiKey,
      hasMailjetSecret: !!mailjetSecretKey,
      fromEmail,
      baseUrl,
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    if (!mailjetApiKey || !mailjetSecretKey) {
      throw new Error('Missing MAILJET_API_KEY or MAILJET_SECRET_KEY environment variable')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('[Weekly Progress] Supabase client created')

    // Parse request body for manual trigger
    let manual = false
    let userIds: string[] | null = null

    try {
      const body = await req.json()
      manual = body?.manual === true
      userIds = body?.userIds || null
    } catch {
      // No body or invalid JSON - that's fine for scheduled runs
    }

    const now = new Date()
    const currentDayOfWeek = now.getUTCDay()

    // Get users who should receive email
    let query = supabase
      .from('user_weekly_email_prefs')
      .select(`
        user_id,
        enabled,
        day_of_week,
        send_time,
        timezone,
        last_sent_at,
        users!inner(id, email, display_name, total_points)
      `)
      .eq('enabled', true)

    if (userIds && userIds.length > 0) {
      // Manual push to specific users
      query = query.in('user_id', userIds)
    } else if (!manual) {
      // Scheduled: filter by day of week
      query = query.eq('day_of_week', currentDayOfWeek)
    }

    console.log('[Weekly Progress] Executing user preferences query...')
    const { data: users, error: userError } = await query

    if (userError) {
      console.error('[Weekly Progress] Error fetching user preferences:', userError)
      throw new Error(`Database query error: ${userError.message}`)
    }

    console.log('[Weekly Progress] Found users with email prefs:', users?.length || 0)

    // Filter by time (unless manual)
    const usersToEmail = manual
      ? (users as UserPreference[]) || []
      : ((users as UserPreference[]) || []).filter((pref) => {
          try {
            const userLocalTime = new Date(
              now.toLocaleString('en-US', { timeZone: pref.timezone })
            )
            const userHour = userLocalTime.getHours()
            const preferredHour = parseInt(pref.send_time.split(':')[0], 10)
            return userHour === preferredHour
          } catch {
            // Invalid timezone, skip
            return false
          }
        })

    const emailsSent: string[] = []
    const errors: string[] = []

    console.log('[Weekly Progress] Users to email:', usersToEmail.length)

    for (const pref of usersToEmail) {
      try {
        console.log(`[Weekly Progress] Processing user ${pref.user_id}...`, {
          hasUsers: !!pref.users,
          email: pref.users?.email,
          displayName: pref.users?.display_name,
          totalPoints: pref.users?.total_points,
        })

        // Safety check for users join
        if (!pref.users || !pref.users.email) {
          console.error(`[Weekly Progress] Missing user data for ${pref.user_id}`)
          errors.push(`${pref.user_id}: Missing user email data`)
          continue
        }

        // Check if already sent this week (unless manual)
        if (!manual && pref.last_sent_at) {
          const lastSent = new Date(pref.last_sent_at)
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (lastSent > weekAgo) {
            console.log(`[Weekly Progress] Skipping ${pref.user_id} - already sent this week`)
            continue
          }
        }

        // Gather user data
        console.log(`[Weekly Progress] Gathering data for user ${pref.user_id}...`)
        const userData = await gatherUserData(
          supabase,
          pref.user_id,
          pref.users.total_points ?? 0
        )
        console.log(`[Weekly Progress] User data gathered for ${pref.user_id}`)

        const weekRange = getWeekRange(now)

        // Render email
        const html = renderWeeklyEmail(
          {
            ...userData,
            displayName: pref.users.display_name || 'Guild Member',
            weekRange,
          },
          baseUrl
        )

        // Send email via Mailjet
        const sendResult = await sendEmailViaMailjet(
          mailjetApiKey,
          mailjetSecretKey,
          pref.users.email,
          pref.users.display_name || 'Guild Member',
          'Your Weekly Progress - Guild Hall',
          html,
          fromEmail
        )

        if (!sendResult.success) {
          console.error(`Error sending email to ${pref.user_id}:`, sendResult.error)
          errors.push(`${pref.user_id}: ${sendResult.error}`)
          continue
        }

        // Update last sent timestamp
        await supabase
          .from('user_weekly_email_prefs')
          .update({ last_sent_at: now.toISOString() })
          .eq('user_id', pref.user_id)

        emailsSent.push(pref.user_id)
        console.log(`Sent weekly progress to user ${pref.user_id}`)
      } catch (err) {
        console.error(`Error processing user ${pref.user_id}:`, err)
        errors.push(
          `${pref.user_id}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        userIds: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('User Weekly Progress Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
