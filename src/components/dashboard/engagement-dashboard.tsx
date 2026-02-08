'use client'

import { useEnrichedStats } from '@/lib/hooks/use-enriched-stats'
import { useContextualGreeting } from '@/lib/hooks/use-contextual-greeting'
import { usePhilosophyQuote } from '@/lib/hooks/use-philosophy-quote'
import { useNudgeBanner } from '@/lib/hooks/use-nudge-banner'
import { useQuestRecommendation } from '@/lib/hooks/use-quest-recommendation'
import { useUserQuests } from '@/lib/hooks/use-user-quests'

import { SkillTierDisplay } from './skill-tier-display'
import { ContextualGreeting } from './contextual-greeting'
import { PhilosophyQuote, PhilosophyQuoteSkeleton } from './philosophy-quote'
import { NudgeBanner } from './nudge-banner'
import { EnrichedStatCard, EnrichedStatCardSkeleton } from './enriched-stat-card'
import { StreakBadge } from './streak-badge'
import { YourPathSection } from './your-path-section'
import { SmartQuestSection } from './smart-quest-section'
import { ActivityFeed } from './activity-feed'
import { GuildEvents } from './guild-events'
import { MentorshipPrompt } from './mentorship-prompt'
import { CelebrationConfetti } from '@/components/ui/celebration-confetti'
import { Skeleton } from '@/components/ui/skeleton'

interface EngagementDashboardProps {
  userId: string
  displayName: string
  userPoints: number
  initialActiveQuests: Array<{
    id: string
    quest_id: string
    quests: {
      id: string
      title: string
      description: string
      points: number
      category_id: string | null
    }
  }>
  guildEventsFeedUrl?: string
  mentorshipSignupUrl?: string
}

export function EngagementDashboard({
  userId,
  displayName,
  userPoints,
  initialActiveQuests,
  guildEventsFeedUrl,
  mentorshipSignupUrl,
}: EngagementDashboardProps) {
  // Fetch enriched stats (includes tier and streak)
  const { stats, isLoading: isLoadingStats } = useEnrichedStats(userId)

  // Fetch contextual greeting
  const { greeting, isLoading: isLoadingGreeting } = useContextualGreeting(
    userId,
    displayName,
    userPoints
  )

  // Fetch philosophy quote
  const { data: quote, isLoading: isLoadingQuote } = usePhilosophyQuote()

  // Fetch nudge banner
  // Skip nudges that duplicate other dashboard components:
  // - approved_ready & deadline_soon: ContextualGreeting already shows these
  // - quest_recommendation: YourPathSection handles this (when no active quests)
  const hasNoActiveQuests = initialActiveQuests.length === 0
  const skipPriorities: Array<'approved_ready' | 'deadline_soon' | 'celebration' | 'quest_recommendation'> = [
    'approved_ready',  // Duplicates ContextualGreeting's "objectives ready to progress" message
    'deadline_soon',   // Duplicates ContextualGreeting's deadline warning
    ...(hasNoActiveQuests ? ['quest_recommendation' as const] : []), // YourPathSection handles this
  ]
  const { nudge, dismiss: dismissNudge, isLoading: isLoadingNudge } = useNudgeBanner(
    userId,
    true, // enableNudges
    skipPriorities
  )

  // Fetch quest recommendation (only if no active quests)
  const { recommendation, isLoading: isLoadingRecommendation } = useQuestRecommendation(
    userId,
    initialActiveQuests.length > 0
  )

  // Check for celebration greeting to trigger confetti
  const showConfetti = greeting.priority === 'celebration'

  return (
    <div className="space-y-6">
      {/* Celebration Confetti (if applicable) */}
      <CelebrationConfetti trigger={showConfetti} />

      {/* Nudge Banner (dismissible) */}
      {nudge && (
        <NudgeBanner nudge={nudge} onDismiss={dismissNudge} />
      )}

      {/* Contextual Greeting */}
      <div className="space-y-2">
        <ContextualGreeting greeting={greeting} />

        {/* Philosophy Quote */}
        <div className="pl-9">
          {isLoadingQuote ? (
            <PhilosophyQuoteSkeleton />
          ) : quote ? (
            <PhilosophyQuote quote={quote} />
          ) : null}
        </div>
      </div>

      {/* Main Content Grid: Left (tier + stats + quests) + Right (events + activity) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Takes 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Tier Display */}
          {isLoadingStats || !stats?.tier ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : (
            <SkillTierDisplay tierInfo={stats.tier} />
          )}

          {/* Enriched Stat Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {isLoadingStats || !stats ? (
              <>
                <EnrichedStatCardSkeleton />
                <EnrichedStatCardSkeleton />
                <EnrichedStatCardSkeleton />
              </>
            ) : (
              <>
                <EnrichedStatCard
                  title="Guild Rank"
                  value={stats.rank || '-'}
                  subValue={stats.totalUsers > 0 ? `of ${stats.totalUsers}` : undefined}
                  description="Your position on the leaderboard"
                  href="/leaderboard"
                />

                <EnrichedStatCard
                  title="Active Quests"
                  value={stats.activeQuests}
                  description="Quests in progress"
                  href="/my-quests"
                />

                <EnrichedStatCard
                  title="Completed"
                  value={stats.completedQuests}
                  subValue={
                    stats.streak && stats.streak.currentStreak > 0 ? (
                      <StreakBadge
                        streak={stats.streak.currentStreak}
                        isAtRisk={stats.streak.isStreakAtRisk}
                        size="sm"
                      />
                    ) : undefined
                  }
                  description={
                    stats.tier
                      ? `${stats.tier.points.toLocaleString()} total points`
                      : 'Total quests completed'
                  }
                  href="/my-quests?status=completed"
                />
              </>
            )}
          </div>

          {/* Mentorship Prompt (for Expert+ users) */}
          {stats?.tier?.tier && (
            <MentorshipPrompt
              userTierLevel={stats.tier.tier.tier_level}
              mentorshipSignupUrl={mentorshipSignupUrl}
            />
          )}

          {/* Your Path Section (Quest Recommendation) */}
          {!isLoadingRecommendation && initialActiveQuests.length === 0 && (
            <YourPathSection
              recommendation={recommendation}
              isLoading={isLoadingRecommendation}
              hasActiveQuests={initialActiveQuests.length > 0}
            />
          )}

          {/* Smart Quest Section (Continue/Featured tabs) */}
          <SmartQuestSection
            activeQuests={initialActiveQuests}
            isLoading={false}
          />
        </div>

        {/* Right column: Events + Activity Feed - uses flex to fill grid cell height */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <GuildEvents feedUrl={guildEventsFeedUrl} className="flex-shrink-0" />
          <ActivityFeed limit={10} className="flex-1 min-h-0" />
        </div>
      </div>
    </div>
  )
}
